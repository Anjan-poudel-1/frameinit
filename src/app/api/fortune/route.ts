import { FrameRequest, getFrameHtmlResponse } from "@coinbase/onchainkit/frame";
import { getFrameMessage } from "@coinbase/onchainkit";
import { getUserDataForFid } from "frames.js";
import { NextRequest, NextResponse } from "next/server";
const fs = require("fs");
const path = require("path");

const quotes = require("@/app/quote");

const userDataPath = path.join(__dirname, "..", "..", "userData.json");

const POST_TEXT = "Anjan ho mero naam okey";

interface UserDataObj {
    [key: string]: {
        description: string;
        userName: string;
        last_fetched: string;
    };
}

async function getResponse(req: NextRequest): Promise<NextResponse> {
    let userData: UserDataObj = {};
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

    try {
        let dataRead = fs.readFileSync(userDataPath, "utf-8");
        userData = JSON.parse(dataRead);
    } catch (err) {
        console.log("err", err);
    }

    let description = "";
    let userName = "";

    const date = getFormattedDate();
    if (userData[userId]) {
        userName = userData[userId].userName;

        if (userData[userId].last_fetched === date) {
            description = userData[userId].description;
        } else {
            let { _description } = saveNewUserData(
                userData,
                userId,
                date,
                userName
            );
            description = _description;
        }
    } else {
        const userDataFromFID = await getUserDataForFid({
            fid: untrustedData.fid,
        });
        console.log("userDataFromFID", userDataFromFID);
        userName = userDataFromFID?.username || "";

        let { _description } = saveNewUserData(
            userData,
            userId,
            date,
            userName
        );
        description = _description;
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

    userData[userId] = {
        userName: _userName,
        description: _description,
        last_fetched: date,
    };

    console.log("userData", userData);

    fs.writeFileSync(userDataPath, JSON.stringify(userData), "utf-8");

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
