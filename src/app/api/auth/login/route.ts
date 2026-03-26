import https from "node:https";
import axios from "axios";
import type { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { BASEURLDOTNETAPI } from "@/lib/base";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  encodeAuthCookie,
} from "@/lib/auth-cookies";

type BackendLoginResponse = {
  jwtToken: string;
  refreshToken: string;
};

type BackendErrorResponse = {
  message?: string;
  error?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data } = await axios.post<BackendLoginResponse>(
      `${BASEURLDOTNETAPI}api/Auth/Login`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
        httpsAgent:
          process.env.NODE_ENV === "development"
            ? new https.Agent({ rejectUnauthorized: false })
            : undefined,
      },
    );

    if (
      typeof data?.jwtToken !== "string" ||
      typeof data?.refreshToken !== "string"
    ) {
      return NextResponse.json(
        { message: "Login response missing tokens." },
        { status: 502 },
      );
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set(
      ACCESS_TOKEN_COOKIE,
      encodeAuthCookie(data.jwtToken),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      },
    );

    response.cookies.set(
      REFRESH_TOKEN_COOKIE,
      encodeAuthCookie(data.refreshToken),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      },
    );

    return response;
  } catch (error) {
    const axiosError = error as AxiosError<BackendErrorResponse>;

    console.error(
      "Login route failed:",
      axiosError.response?.status ?? axiosError.code ?? error,
      axiosError.response?.data ?? "",
    );

    if (axiosError.response) {
      return NextResponse.json(
        {
          message:
            axiosError.response.data?.message ??
            axiosError.response.data?.error ??
            "Login failed",
        },
        { status: axiosError.response.status },
      );
    }

    return NextResponse.json(
      {
        message: "Unable to login right now",
      },
      {
        status: 500,
      },
    );
  }
}
