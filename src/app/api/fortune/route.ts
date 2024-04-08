import { FrameRequest, getFrameHtmlResponse } from "@coinbase/onchainkit/frame";
import { getFrameMessage } from "@coinbase/onchainkit";
import { getUserDataForFid } from "frames.js";
import { NextRequest, NextResponse } from "next/server";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
const fs = require("fs");
const path = require("path");

const quotes = require("@/app/quote");

// Number of base images, for randomisation. Make sure this is correct.

const numberOfBase = 10;

// Text that will appear when a user wishes to share his/her result.
const POST_TEXT =
    "Got my daily fortune revealed by /janani! Click to find out what's in store for you.";

// Interface for userData object.
interface UserDataObj {
    description: string;
    userName: string;
    last_fetched: string;
    id: string;
    fid: string;
    base_image: string; //saved to shared the image
}

const initUserData = {
    description: "",
    userName: "",
    last_fetched: "",
    id: "",
    fid: "",
    base_image: "1",
};

async function getResponse(req: NextRequest): Promise<NextResponse> {
    let userData: UserDataObj = initUserData;
    const body: FrameRequest = await req.json();

    const { untrustedData, trustedData } = body; // The data received from frame consist of untrustedData and trustedData.Explore documentation for more,

    console.log("body", body);

    const { isValid, message } = await getFrameMessage(body, {
        allowFramegear: true,
    });

    if (!isValid) {
        return new NextResponse(
            getFrameHtmlResponse({
                image: { src: `${process.env.NEXT_PUBLIC_SITE_URL}/error.png` },
            })
        );
    }

    // Unique fid for a user.
    let userId = untrustedData.fid.toString();

    console.log("user id is ", userId);

    // Create a collection reference for firestore
    const collectionRef = collection(db, "userData");

    try {
        const q = query(collectionRef, where("fid", "==", userId));
        await getDocs(q)
            .then((querySnapshot) => {
                const newData = querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id.toString(),
                }));
                userData = (newData[0] as UserDataObj) || initUserData;
            })
            .catch((err) => {
                console.log("errrrr", err);
            });
    } catch (err) {
        console.log("err", err);
    }

    let description = "";
    let userName = "";
    let baseImage = "1";
    const date = getFormattedDate();

    let randomImageNumber = Math.ceil(Math.random() * numberOfBase);
    baseImage = randomImageNumber.toString();

    if (userData.id) {
        // If the user is already present
        userName = userData.userName;

        if (userData.last_fetched === date) {
            // For same date, we donot generate new description/quote. 1 quote/day

            description = userData.description;
        } else {
            const randomNumber = Math.ceil(Math.random() * quotes.length);
            let _description = quotes[randomNumber]; //Fetch random quote

            let toUpdate = {
                description: _description,
                last_fetched: date,
                base_image: baseImage,
            };
            console.log("to update", toUpdate);
            await updateDoc(doc(db, "userData", userData.id), toUpdate);
            description = _description;
        }
    } else {
        // For new user
        const userDataFromFID = await getUserDataForFid({
            fid: untrustedData.fid,
        });
        console.log("userDataFromFID", userDataFromFID);
        userName = userDataFromFID?.username || "anon";

        const randomNumber = Math.ceil(Math.random() * quotes.length);
        let _description = quotes[randomNumber];

        let dataToSave = {
            fid: userId,
            userName: userName,
            description: _description,
            last_fetched: date,
            base_image: baseImage,
        };
        description = _description;

        await addDoc(collectionRef, dataToSave);
        console.log("data is saved");
    }

    return new NextResponse(
        // Creates metadata required for frame.
        getFrameHtmlResponse({
            buttons: [
                {
                    label: "Share my result", // sharing the cast is redirecting to link that consists of composedText and embedded url
                    action: "link",
                    target: encodeURI(
                        `https://warpcast.com/~/compose?text=${POST_TEXT}&embeds[]=${process.env.NEXT_PUBLIC_SITE_URL}/myfortune/${userId}`
                    ),
                },
                {
                    label: "Visit Website",
                    action: "link",
                    target: "https://jananinft.art/",
                },
            ],
            image: {
                //   src: `${process.env.NEXT_PUBLIC_SITE_URL}/jananibase/base1.png`,
                src: `${process.env.NEXT_PUBLIC_SITE_URL}/prediction?desc=${description}&userName=${userName}&date=${date}`,
                aspectRatio: "1:1",
            },
        })
    );
}

async function getUserResponse(req: NextRequest, res: NextResponse) {
    let userData = initUserData;
    const { searchParams } = new URL(req.url);

    const hasFID = searchParams.has("fid");
    const fID = hasFID ? searchParams.get("fid") : "0";

    const collectionRef = collection(db, "userData"); // collection reference.
    try {
        const q = query(collectionRef, where("fid", "==", fID));
        await getDocs(q)
            .then((querySnapshot) => {
                const newData = querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id.toString(),
                }));
                userData = (newData[0] as UserDataObj) || initUserData;
            })
            .catch((err) => {
                console.log("errrrr", err);
            });

        console.log("userdata k cha ta?", userData);

        return new NextResponse(JSON.stringify(userData));
    } catch (err) {
        console.log("err", err);
    }
}

// Get the date in format "MM DD, YYYY"
const getFormattedDate = () => {
    const currentDate = new Date();
    return currentDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

// Get api
export async function GET(req: NextRequest, res: NextResponse) {
    return getUserResponse(req, res);
}

// Post api
export async function POST(req: NextRequest): Promise<Response> {
    return getResponse(req);
}

export const dynamic = "force-dynamic";
