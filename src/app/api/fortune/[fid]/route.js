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
import { NextRequest, NextResponse } from "next/server";

const fs = require("fs");
const path = require("path");

const initUserData = {
    description: "",
    userName: "",
    last_fetched: "",
    id: "",
    fid: "",
    base_image: "1",
};

async function getResponse(req, res) {
    let userData = initUserData;
    console.log("request k aacha ?", req);
    let { fid } = req.query;
    const collectionRef = collection(db, "userData");
    try {
        const q = query(collectionRef, where("fid", "==", fid));
        await getDocs(q)
            .then((querySnapshot) => {
                const newData = querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id.toString(),
                }));
                userData = newData[0] || initUserData;
            })
            .catch((err) => {
                console.log("errrrr", err);
            });

        console.log("userdata k cha ta?", userData);

        return res.status(200).json(userData);
    } catch (err) {
        console.log("err", err);
    }
}

export async function GET(req, res) {
    return getResponse(req, res);
}

export const dynamic = "force-dynamic";
