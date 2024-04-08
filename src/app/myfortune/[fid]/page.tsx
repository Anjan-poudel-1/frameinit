// To share fortune of a user.

import type { Metadata } from "next";

type Props = {
    params: { fid: string };
};
interface UserDataObj {
    description: string;
    userName: string;
    last_fetched: string;
    id: string;
    fid: string;
    base_image: string;
}
const initUserData = {
    description: "",
    userName: "",
    last_fetched: "",
    id: "",
    fid: "",
    base_image: "1",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const fid = params.fid; //unique fid to a user

    let userData: UserDataObj = initUserData;

    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/fortune?fid=${fid}`, {
        cache: "no-cache",
    })
        .then((res) => {
            return res.json();
        })
        .then((response: UserDataObj) => {
            console.log("response k aayo ta", response);
            userData = response;
        })
        .catch((err) => {
            console.log("error aayo", err);
        });

    const imgSrc = `${process.env.NEXT_PUBLIC_SITE_URL}/prediction?desc=${userData.description}&userName=${userData.userName}&date=${userData.last_fetched}&base=${userData.base_image}`;

    console.log("image", imgSrc);
    // const userData =  //fetch dynamic data here
    return {
        title: "My Fortune Frame",
        description: "A Farcaster Fortune Frame",
        openGraph: {
            title: "My Fortune Frame",
            description: "A Farcaster Fortune Frame",
            images: [`${process.env.NEXT_PUBLIC_SITE_URL}/jananisiteimage.png`],
        },
        other: {
            "fc:frame": "vNext",
            "fc:frame:image": `${imgSrc}`,
            "fc:frame:post_url": `${process.env.NEXT_PUBLIC_SITE_URL}/api/fortune`,
            "fc:frame:button:1": "Reveal My Fortune 🔮",
            "fc:frame:image:aspect_ratio": "1:1",
        },
    };
}

export default function Page() {
    return (
        <div>
            <h1>My Fortune Frame</h1>
        </div>
    );
}
