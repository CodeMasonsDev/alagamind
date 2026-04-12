import https from "node:https";
import axios from "axios";
import type { AxiosError } from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, decodeAuthCookie } from "@/lib/auth-cookies";
import { BASEURLDOTNETAPI } from "@/lib/base";
import {
  getProfilePicturePublicUrl,
  removeProfilePicture,
  saveProfilePicture,
} from "@/lib/profile-picture";

type BackendErrorResponse = {
  message?: string;
  error?: string;
};

type BackendProfileResponse = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  roles: string[];
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        { message: "Select an image file to upload." },
        { status: 400 },
      );
    }

    if (fileEntry.size <= 0) {
      return NextResponse.json(
        { message: "The selected file is empty." },
        { status: 400 },
      );
    }

    const { user } = await getAuthenticatedUser();

    const profileImageUrl = await saveProfilePicture(user.id, fileEntry);

    return NextResponse.json({
      message: "Profile picture uploaded successfully.",
      profileImageUrl,
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        roles: user.roles,
        profileImageUrl:
          profileImageUrl || (await getProfilePicturePublicUrl(user.id)),
      },
    });
  } catch (error) {
    const axiosError = error as AxiosError<BackendErrorResponse>;

    return NextResponse.json(
      {
        message:
          axiosError.response?.data?.message ??
          axiosError.response?.data?.error ??
          (error instanceof Error
            ? error.message
            : "Unable to upload profile picture."),
      },
      { status: axiosError.response?.status ?? 500 },
    );
  }
}

export async function DELETE() {
  try {
    const { user } = await getAuthenticatedUser();
    const profileImageUrl = await removeProfilePicture(user.id);

    return NextResponse.json({
      message: "Profile picture removed.",
      profileImageUrl,
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        roles: user.roles,
        profileImageUrl,
      },
    });
  } catch (error) {
    const axiosError = error as AxiosError<BackendErrorResponse>;

    return NextResponse.json(
      {
        message:
          axiosError.response?.data?.message ??
          axiosError.response?.data?.error ??
          (error instanceof Error
            ? error.message
            : "Unable to remove profile picture."),
      },
      { status: axiosError.response?.status ?? 500 },
    );
  }
}

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const storedAccessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const accessToken = decodeAuthCookie(storedAccessToken);

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const { data: user } = await axios.get<BackendProfileResponse>(
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

  return { accessToken, user };
}
