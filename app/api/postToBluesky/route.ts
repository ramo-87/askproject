import { NextResponse } from "next/server";
import axios from "axios";
import { promises as fs } from "fs";
import path from "path";

interface PostBody {
  text: string;
  questionId: number;
}

interface BlueskySessionResponse {
  accessJwt: string;
  did: string;
  handle: string;
}

interface BlueskyPostResponse {
  uri: string;
  cid: string;
}

interface ReplyRecord {
  [questionId: string]: {
    uri: string;
    cid: string;
  };
}

// Path to JSON file
const FILE_PATH = path.join(process.cwd(), "data", "blueskyReplies.json");

async function readReplies(): Promise<ReplyRecord> {
  try {
    const content = await fs.readFile(FILE_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writeReplies(data: ReplyRecord) {
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
}

export async function POST(req: Request) {
  try {
    const { text, questionId } = (await req.json()) as PostBody;
    const replies = await readReplies();

    // Step 1: Login to Bluesky
    const loginRes = await axios.post<BlueskySessionResponse>(
      "https://bsky.social/xrpc/com.atproto.server.createSession",
      {
        identifier: process.env.BLUESKY_USERNAME,
        password: process.env.BLUESKY_APP_PASSWORD,
      }
    );

    const accessJwt = loginRes.data.accessJwt;
    const did = loginRes.data.did;

    // Step 2: Determine parent reply
    const allIds = Object.keys(replies);
    const lastId = allIds.length > 0 ? allIds[allIds.length - 1] : null;
    const lastReply = lastId ? replies[lastId] : null;

    const rootUri = process.env.BLUESKY_ROOT_URI!;
    const rootCid = process.env.BLUESKY_ROOT_CID!;

    const replyPayload = {
      root: { uri: rootUri, cid: rootCid },
      parent: lastReply
        ? { uri: lastReply.uri, cid: lastReply.cid }
        : { uri: rootUri, cid: rootCid },
    };

    // Step 3: Create new Bluesky reply
    const res = await axios.post<BlueskyPostResponse>(
      "https://bsky.social/xrpc/com.atproto.repo.createRecord",
      {
        repo: did,
        collection: "app.bsky.feed.post",
        record: {
          text,
          createdAt: new Date().toISOString(),
          reply: replyPayload,
        },
      },
      {
        headers: { Authorization: `Bearer ${accessJwt}` },
      }
    );

    // Step 4: Store the new reply under the question ID
    replies[questionId] = {
      uri: res.data.uri,
      cid: res.data.cid,
    };

    await writeReplies(replies);

    return NextResponse.json({ success: true, data: res.data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to post to Bluesky" },
      { status: 500 }
    );
  }
}
