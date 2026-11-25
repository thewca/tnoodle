import axios from "axios";

// stolen from https://redocly.com/docs/cli/guides/use-generated-client#the-http-layer
const axiosAdapter: typeof fetch = async (input, init) => {
    const response = await axios.request({
        url: typeof input === "string" ? input : input.toString(),
        method: init?.method ?? "GET",
        headers: init?.headers as Record<string, string>,
        data: init?.body,
        responseType: "text",
        validateStatus: () => true,
    });

    return new Response(response.data, {
        status: response.status,
        headers: response.headers as HeadersInit,
    });
};

export default axiosAdapter;
