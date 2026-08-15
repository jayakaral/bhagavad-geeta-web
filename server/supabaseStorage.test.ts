import { describe, expect, it } from "vitest";

describe("Supabase storage credentials", () => {
  it("can list storage buckets with the configured service role", async () => {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(url).toBeTruthy();
    expect(serviceRoleKey).toBeTruthy();

    const response = await fetch(`${url}/storage/v1/bucket`, {
      headers: {
        apikey: serviceRoleKey!,
        Authorization: `Bearer ${serviceRoleKey!}`,
      },
    });

    expect(response.status).toBe(200);
  });
});
