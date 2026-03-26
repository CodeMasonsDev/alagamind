import https from "node:https";
import axios from "axios";
import type { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { BASEURLDOTNETAPI } from "@/lib/base";

type BackendRegisterRequest = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

type BackendProfile = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  roles: string[];
};

type BackendRegisterResponse = {
  message?: string;
  Message?: string;
  result?: BackendProfile;
  Result?: BackendProfile;
};

type BackendErrorResponse = {
  message?: string;
  error?: string;
  Error?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BackendRegisterRequest;

    const { data } = await axios.post<BackendRegisterResponse>(
      `${BASEURLDOTNETAPI}api/User/Register`,
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

    return NextResponse.json({
      message: data.Message ?? data.message ?? "Registered successfully",
      user: data.Result ?? data.result ?? null,
    });
  } catch (error) {
    const axiosError = error as AxiosError<BackendErrorResponse>;

    console.error(
      "Register route failed:",
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
            "Registration failed",
        },
        { status: axiosError.response.status },
      );
    }

    return NextResponse.json(
      {
        message: "Unable to register right now",
      },
      {
        status: 500,
      },
    );
  }
}
