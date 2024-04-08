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

const POST_TEXT =
    "Got my daily fortune revealed by /janani! Click to find out what's in store for you. 🔮";

interface UserDataObj {
    description: string;
    userName: string;
    last_fetched: string;
    id: string;
    fid: string;
}

const initUserData = {
    description: "",
    userName: "",
    last_fetched: "",
    id: "",
    fid: "",
};

async function getResponse(req: NextRequest): Promise<NextResponse> {
    let userData: UserDataObj = initUserData;
    const body: FrameRequest = await req.json();

    const { untrustedData, trustedData } = body;

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

    //   console.log("untrustedData",untrustedData);
    //   console.log("trustedData",trustedData);

    // Afaile gareko

    let userId = untrustedData.fid.toString();
    console.log("user id is ", userId);
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

    const date = getFormattedDate();
    if (userData.id) {
        userName = userData.userName;

        if (userData.last_fetched === date) {
            description = userData.description;
        } else {
            const randomNumber = Math.ceil(Math.random() * quotes.length);
            let _description = quotes[randomNumber];

            let toUpdate = {
                description: _description,
                last_fetched: date,
            };
            console.log("to update", toUpdate);
            await updateDoc(doc(db, "userData", userData.id), toUpdate);
            description = _description;
        }
    } else {
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
        };
        description = _description;

        await addDoc(collectionRef, dataToSave);
        console.log("data is saved");
    }

    return new NextResponse(
        getFrameHtmlResponse({
            buttons: [
                {
                    label: "Re-cast",
                    action: "link",
                    target: encodeURI(
                        `https://warpcast.com/~/compose?text=${POST_TEXT}&embeds[]=${process.env.NEXT_PUBLIC_SITE_URL}/fortune`
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

const saveNewUserData = (
    userData: UserDataObj,
    userId: string,
    date: string,
    _userName: string
): { _description: string } => {
    const randomNumber = Math.ceil(Math.random() * quotes.length);
    let _description = quotes[randomNumber];

    let dataToSave = {
        fid: userId,
        userName: _userName,
        description: _description,
        last_fetched: date,
    };

    console.log("userData", dataToSave);

    return { _description };
};
const getFormattedDate = () => {
    const currentDate = new Date();
    return currentDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

export async function POST(req: NextRequest): Promise<Response> {
    return getResponse(req);
}

export const dynamic = "force-dynamic";
