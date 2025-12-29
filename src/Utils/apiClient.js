import merge from "lodash/merge";
import { getSession } from "next-auth/react";

const base_url = process.env.NEXT_PUBLIC_BACKEND_URL;

const URLS = {
  blogs: `${base_url}/blog`,
  otp: `${base_url}/otp`,
  user: `${base_url}/users`,
  s3bucket: "s3bucket",
  training: `${base_url}/api/training`,
  leaderboard: `${base_url}/leaderboard`,
  agent: `${base_url}/agent`,
  deals: `${base_url}/deals`,
  designation: `${base_url}/api/designation`,
  employee: `${base_url}/employee`,
  permissions: `${base_url}/permissions`,
  designationPermissions: `${base_url}/admin/designations`,
  login: `${base_url}/auth/login`,
  forgotPassword: `${base_url}/auth`,
  chat: `${base_url}/chat/threads`,
  chatDm: `${base_url}/chat/dm`,
  chatChannels: `${base_url}/chat/channels`,
  resources: `${base_url}/admin/resources`,
  addresses: `${base_url}/addresses`,
  chatHistory: `${base_url}/chat/admin/chat-history`,
  chatHistoryDelete: `${base_url}/chat/admin/chat-history/delete`,
  resourcesadmin: `${base_url}/chat/admin/resources`,
  users: `${base_url}/users`,
};

export function encodeQueryData(data = {}) {
  const params = new URLSearchParams();
  for (const key in data) {
    const value = data[key];
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined && value !== null) {
      params.append(key, value);
    }
  }
  return "?" + params.toString();
}

export function tryParseJSON(json) {
  if (!json) {
    return null;
  }
  try {
    return JSON.parse(json);
  } catch (e) {
    throw new Error(`Failed to parse unexpected JSON response: ${json}`);
  }
}

const getResponseBody = (response) => {
  const contentType = response.headers.get("content-type");
  return contentType && contentType.indexOf("json") >= 0
    ? response.clone().text().then(tryParseJSON)
    : response.clone().text();
};

function ResponseError(status, response, body) {
  this.name = "ResponseError";
  this.status = status;
  this.response = response;
  this.body = body;
}
ResponseError.prototype = Error.prototype;

export const retrieveToken = async (ctx = undefined) => {
  if (ctx?.req) {
    const session = await getSession(ctx);
    return session?.accessToken || "";
  } else {
    const session = await getSession();
    return session?.accessToken || "";
  }
};
const makeHeadersAndParams = async (params, auth, type, ctx) => {
  const { headers = {}, ...restParams } = params;

  const baseHeaders =
    type === "file"
      ? {}
      : {
          "Content-Type": "application/json",
          Accept: "application/json",
        };

  let headerConfig = new Headers(merge(baseHeaders, headers));

  if (auth && !headerConfig.get("Authorization")) {
    const session = ctx ? await getSession(ctx) : await getSession();
    const token = session?.accessToken || "";
    if (token) headerConfig.set("Authorization", `Bearer ${token}`);
  }

  return { headers: headerConfig, params: restParams };
};

const request = async ({
  url = "",
  method = "GET",
  params = {},
  auth = false,
  type,
  ctx = undefined,
}) => {
  const { headers, params: apiParams } = await makeHeadersAndParams(
    params,
    auth,
    type,
    ctx
  );
  const options = {
    method,
    headers,
  };
  if (method === "GET") {
    if (Object.keys(apiParams).length > 0) url += encodeQueryData(apiParams);
  } else {
    options["body"] = type === "file" ? params : JSON.stringify(apiParams);
  }

  return fetch(url, options).then((response) => {
    return getResponseBody(response).then((body = {}) => {
      if (response.ok) {
        return { body, status: response.status };
      } else {
        throw new ResponseError(response.status, response, body);
      }
    });
  });
};

const _request = request;

const get = (url, params, auth = false, ctx = undefined) => {
  return _request({
    method: "GET",
    url,
    params,
    auth,
  });
};

const post = (url, params, auth = false, type) => {
  return _request({
    method: "POST",
    url,
    params,
    auth,
    type,
  });
};

const put = (url, params, auth = false) => {
  return _request({
    method: "PUT",
    url,
    params,
    auth,
  });
};

const patch = (url, params, auth = false) => {
  return _request({
    method: "PATCH",
    url,
    params,
    auth,
  });
};

const _delete = (url, params, auth = false) => {
  return _request({
    method: "DELETE",
    url,
    params,
    auth,
  });
};

const apiClient = {
  URLS,
  get,
  post,
  put,
  patch,
  delete: _delete,
  raw: _request,
};

export default apiClient;
