import axiosInstance from "@/lib/axios";
import { BASEURLDOTNETAPI } from "@/lib/base";

export type AdminUserDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
};

export type CreateAdminDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isActive: boolean;
  roleId?: number;
};

export type UpdateAdminDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  roleId?: number;
};

export type ResetPasswordDto = {
  userId: string;
  newPassword: string;
};

export async function getAllUsers(): Promise<AdminUserDto[]> {
  try {
    const response = await axiosInstance.get<AdminUserDto[]>(
      `${BASEURLDOTNETAPI}api/admin/users`
    );
    console.log("✅ Get all users success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Get all users error:", error);
    throw new Error(`Failed to fetch users: ${error}`);
  }
}

export async function getUserById(id: string): Promise<AdminUserDto> {
  try {
    const response = await axiosInstance.get<AdminUserDto>(
      `${BASEURLDOTNETAPI}api/admin/users/${id}`
    );
    console.log("✅ Get user by id success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Get user by id error:", error);
    throw new Error(`Failed to fetch user: ${error}`);
  }
}

export async function createUser(
  createAdminDto: CreateAdminDto
): Promise<AdminUserDto> {
  try {
    const response = await axiosInstance.post<AdminUserDto>(
      `${BASEURLDOTNETAPI}api/admin/users`,
      createAdminDto
    );
    console.log("✅ Create user success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Create user error:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "data" in error.response
    ) {
      const data = (error.response as any).data;
      if (data?.errors && typeof data.errors === "object") {
        const messages = Object.entries(data.errors)
          .map(([field, msgs]: [string, any]) =>
            `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
          )
          .join(" | ");
        throw new Error(messages);
      }
      throw new Error(data?.message ?? data?.title ?? JSON.stringify(data));
    }
    throw new Error(`Failed to create user: ${error}`);
  }
}

export async function updateUser(
  updateAdminDto: UpdateAdminDto
): Promise<AdminUserDto> {
  try {
    const response = await axiosInstance.put<AdminUserDto>(
      `${BASEURLDOTNETAPI}api/admin/users/${updateAdminDto.id}`,
      updateAdminDto
    );
    console.log("✅ Update user success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Update user error:", error);
    throw new Error(`Failed to update user: ${error}`);
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`${BASEURLDOTNETAPI}api/admin/users/${id}`);
    console.log("✅ Delete user success");
  } catch (error) {
    console.error("❌ Delete user error:", error);
    throw new Error(`Failed to delete user: ${error}`);
  }
}

export async function assignRole(
  userId: string,
  roleId: number
): Promise<void> {
  try {
    await axiosInstance.post(
      `${BASEURLDOTNETAPI}api/admin/users/${userId}/roles/${roleId}`
    );
    console.log("✅ Assign role success");
  } catch (error) {
    console.error("❌ Assign role error:", error);
    throw new Error(`Failed to assign role: ${error}`);
  }
}

export async function removeRole(
  userId: string,
  roleId: number
): Promise<void> {
  try {
    await axiosInstance.delete(
      `${BASEURLDOTNETAPI}api/admin/users/${userId}/roles/${roleId}`
    );
    console.log("✅ Remove role success");
  } catch (error) {
    console.error("❌ Remove role error:", error);
    throw new Error(`Failed to remove role: ${error}`);
  }
}

export async function resetPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  try {
    await axiosInstance.post(
      `${BASEURLDOTNETAPI}api/admin/users/${userId}/reset-password`,
      { userId, newPassword }
    );
    console.log("✅ Reset password success");
  } catch (error) {
    console.error("❌ Reset password error:", error);
    throw new Error(`Failed to reset password: ${error}`);
  }
}

export async function searchUsers(
  email?: string,
  firstName?: string,
  lastName?: string,
  isActive?: boolean
): Promise<AdminUserDto[]> {
  try {
    const params = new URLSearchParams();
    if (email) params.append("email", email);
    if (firstName) params.append("firstName", firstName);
    if (lastName) params.append("lastName", lastName);
    if (isActive !== undefined) params.append("isActive", String(isActive));

    const response = await axiosInstance.get<AdminUserDto[]>(
      `${BASEURLDOTNETAPI}api/admin/users/search?${params.toString()}`
    );
    console.log("✅ Search users success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Search users error:", error);
    throw new Error(`Failed to search users: ${error}`);
  }
}
