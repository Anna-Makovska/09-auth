import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "../../api";
import { parse } from "cookie";
import { isAxiosError } from "axios";
import { logErrorResponse } from "../../_utils/utils";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ success: false }, { status: 200 });
    }

    // Try to get user data
    try {
      const userRes = await api.get("/users/me", {
        headers: {
          Cookie: cookieStore.toString(),
        },
      });

      return NextResponse.json({ success: true, user: userRes.data }, { status: 200 });
    } catch (userError) {
      // If accessToken expired but we have refreshToken, try to refresh
      if (refreshToken && isAxiosError(userError) && userError.response?.status === 401) {
        try {
          const apiRes = await api.get("auth/session", {
            headers: {
              Cookie: cookieStore.toString(),
            },
          });

          const setCookie = apiRes.headers["set-cookie"];

          if (setCookie) {
            const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
            for (const cookieStr of cookieArray) {
              const parsed = parse(cookieStr);

              const options = {
                expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
                path: parsed.Path,
                maxAge: Number(parsed["Max-Age"]),
              };

              if (parsed.accessToken)
                cookieStore.set("accessToken", parsed.accessToken, options);
              if (parsed.refreshToken)
                cookieStore.set("refreshToken", parsed.refreshToken, options);
            }

            // Try to get user data again with new token
            const userRes = await api.get("/users/me", {
              headers: {
                Cookie: cookieStore.toString(),
              },
            });

            return NextResponse.json({ success: true, user: userRes.data }, { status: 200 });
          }
        } catch (refreshError) {
          logErrorResponse(isAxiosError(refreshError) ? refreshError.response?.data : { message: (refreshError as Error).message });
          return NextResponse.json({ success: false }, { status: 200 });
        }
      }

      logErrorResponse(isAxiosError(userError) ? userError.response?.data : { message: (userError as Error).message });
      return NextResponse.json({ success: false }, { status: 200 });
    }
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json({ success: false }, { status: 200 });
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
