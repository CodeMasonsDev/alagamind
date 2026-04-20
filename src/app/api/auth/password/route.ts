import https from "node:https";
import axios from "axios";
import type { AxiosError } from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, decodeAuthCookie } from "@/lib/auth-cookies";
import { BASEURLDOTNETAPI } from "@/lib/base";

type UpdatePasswordRequest = {
  email: string;
  currentPassword: string;
  newPassword: string;
};

type BackendErrorResponse = {
  message?: string;
  error?: string;
  Error?: string;
};

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const storedAccessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    const accessToken = decodeAuthCookie(storedAccessToken);

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as UpdatePasswordRequest;

    await axios.put(`${BASEURLDOTNETAPI}api/User/update-password`, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      httpsAgent:
        process.env.NODE_ENV === "development"
          ? new https.Agent({ rejectUnauthorized: false })
          : undefined,
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    const axiosError = error as AxiosError<BackendErrorResponse>;

    console.error(
      "UpdatePassword route failed:",
      axiosError.response?.status ?? axiosError.code ?? error,
      axiosError.response?.data ?? "",
    );

    if (axiosError.response) {
      return NextResponse.json(
        {
          message:
            axiosError.response.data?.message ??
            axiosError.response.data?.error ??
            axiosError.response.data?.Error ??
            "Failed to update password",
        },
        { status: axiosError.response.status },
      );
    }

    return NextResponse.json(
      { message: "Unable to update password right now" },
      { status: 500 },
    );
  }
}
