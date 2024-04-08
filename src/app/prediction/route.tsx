import { ImageResponse } from "next/og";
// App router includes @vercel/og.
// No need to install it.

export const runtime = "edge";
const numberOfBase = 10;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // const hasTitle = searchParams.has("title");
        // const title = hasTitle
        //     ? searchParams.get("title")?.slice(0, 100)
        //     : "Default Title";

        // // ?description=
        const hasDescription = searchParams.has("desc");
        const description = hasDescription ? searchParams.get("desc") : "";
        const hasUsername = searchParams.has("userName");
        const userName = hasUsername ? searchParams.get("userName") : "";
        const hasDate = searchParams.has("date");
        const date = hasDate ? searchParams.get("date") : "";

        const hasBaseSelected = searchParams.has("base");
        const selectedBase = hasBaseSelected ? searchParams.get("base") : "";

        let baseImageURL = "";
        if (selectedBase) {
            baseImageURL = `${process.env.NEXT_PUBLIC_SITE_URL}/jananibase/base${selectedBase}.png`;
        } else {
            let randomNumber = Math.ceil(Math.random() * numberOfBase);
            baseImageURL = `${process.env.NEXT_PUBLIC_SITE_URL}/jananibase/base${randomNumber}.png`;
        }

        console.log("baseImageURL", baseImageURL);

        // returns the image response.... generating dynamic images
        return new ImageResponse(
            (
                <div
                    style={{
                        display: "flex",
                        position: "relative",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "contain",
                        width: "100%",
                        height: "100%",
                        backgroundImage: `url(${baseImageURL})`,
                        fontSize: "38px",
                        color: "brown",
                        fontWeight: "400",
                        fontFamily: "serif",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            width: "76%",
                            top: "13%",
                            left: "51%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            fontFamily: "serif",
                        }}
                    >
                        Gm @{userName},
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            width: "76%",
                            top: "20%",
                            left: "51%",
                            transform: "translateX(-50%)",
                        }}
                    >
                        {description}
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            width: "76%",
                            top: "45.5%",
                            left: "51%",
                            transform: "translateX(-50%)",
                            fontSize: "24px",
                            display: "flex",
                            color: "#000",
                        }}
                    >
                        Date: {date}
                    </div>
                </div>
            ),
            {
                width: 1081, //specify the size of image here.
                height: 1081,
            }
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
