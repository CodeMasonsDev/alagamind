import https from "node:https";
import axios from "axios";
import type { AxiosError } from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, decodeAuthCookie } from "@/lib/auth-cookies";
import { normalizeRoles } from "@/lib/auth-roles";
import { BASEURLDOTNETAPI } from "@/lib/base";
import { getProfilePicturePublicUrl } from "@/lib/profile-picture";

type BackendErrorResponse = {
  message?: string;
  error?: string;
};

export async function GET() {
  try {
    // ✅ Get cookie correctly (NO await)
    const cookieStore = await cookies();
    const storedAccessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    // 🔍 Debug (optional - remove in prod)
    console.log("RAW COOKIE:", storedAccessToken);

    const accessToken = decodeAuthCookie(storedAccessToken);

    console.log("DECODED TOKEN:", accessToken);

    // ❌ No token → unauthorized
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Call your .NET backend
    const { data } = await axios.get(`${BASEURLDOTNETAPI}api/User/GetProfile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      httpsAgent:
        process.env.NODE_ENV === "development"
          ? new https.Agent({ rejectUnauthorized: false })
          : undefined,
    });

    // 🔥 IMPORTANT: Normalize response
    // backend: { value: {...}, isSuccess: true }
    // frontend should receive ONLY the user
    const user = data;

    if (!user) {
      return NextResponse.json(
        { message: "Invalid user data" },
        { status: 500 },
      );
    }
    console.log("user", user);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      roles: normalizeRoles(user.roles),
      profileImageUrl: await getProfilePicturePublicUrl(user.id),
    });
  } catch (error) {
    const axiosError = error as AxiosError<BackendErrorResponse>;

    console.error(
      "❌ GetProfile route failed:",
      axiosError.response?.status ?? axiosError.code ?? error,
      axiosError.response?.data ?? "",
    );

    return NextResponse.json(
      {
        message:
          axiosError.response?.data?.message ??
          axiosError.response?.data?.error ??
          "Unauthorized",
      },
      {
        status: axiosError.response?.status ?? 401,
      },
    );
  }
}
