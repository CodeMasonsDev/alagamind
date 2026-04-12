import https from "node:https";
import axios from "axios";
import type { AxiosError } from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, decodeAuthCookie } from "@/lib/auth-cookies";
import { BASEURLDOTNETAPI } from "@/lib/base";
import { getProfilePicturePublicUrl } from "@/lib/profile-picture";

type UpdateProfileRequest = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
};

type BackendErrorResponse = {
  message?: string;
  error?: string;
  Error?: string;
};

type BackendProfileEnvelope = {
  value?: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    roles: string[];
  };
};

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const storedAccessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    const accessToken = decodeAuthCookie(storedAccessToken);

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as UpdateProfileRequest;

    await axios.put(`${BASEURLDOTNETAPI}api/User/UpdateProfile`, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      httpsAgent:
        process.env.NODE_ENV === "development"
          ? new https.Agent({ rejectUnauthorized: false })
          : undefined,
    });

    const { data } = await axios.get<BackendProfileEnvelope>(
      `${BASEURLDOTNETAPI}api/User/GetProfile`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        httpsAgent:
          process.env.NODE_ENV === "development"
            ? new https.Agent({ rejectUnauthorized: false })
            : undefined,
      },
    );

    const user = data?.value;

    return NextResponse.json({
      message: "Profile updated successfully",
      user: user
        ? {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            roles: user.roles,
            profileImageUrl: await getProfilePicturePublicUrl(user.id),
          }
        : null,
    });
  } catch (error) {
    const axiosError = error as AxiosError<BackendErrorResponse>;

    console.error(
      "UpdateProfile route failed:",
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
            "Failed to update profile",
        },
        { status: axiosError.response.status },
      );
    }

    return NextResponse.json(
      { message: "Unable to update profile right now" },
      { status: 500 },
    );
  }
}
