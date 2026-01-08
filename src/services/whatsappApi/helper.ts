export function getFacebookHeaders(permanent_token: string) {
  return {
    Authorization: `Bearer ${permanent_token}`,
    "Content-Type": "application/json",
  };
}