import type { Metadata } from "next";

// See documentation for reference to the metadata required.

export const metadata: Metadata = {
    title: "Fortune Frame",
    description: "A Farcaster Fortune Frame",
    openGraph: {
        title: "Fortune Frame",
        description: "A Farcaster Fortune Frame",
        images: [`${process.env.NEXT_PUBLIC_SITE_URL}/jananisiteimage.png`],
    },
    other: {
        "fc:frame": "vNext",
        "fc:frame:image": `${process.env.NEXT_PUBLIC_SITE_URL}/jananisiteimage.png`,
        "fc:frame:post_url": `${process.env.NEXT_PUBLIC_SITE_URL}/api/fortune`,
        "fc:frame:button:1": "Reveal My Fortune 🔮",
        "fc:frame:image:aspect_ratio": "1:1",
    },
};

export default function Page() {
    return (
        <div>
            <h1>Fortune Frame</h1>
        </div>
    );
}
