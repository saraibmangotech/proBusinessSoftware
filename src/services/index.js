import instance from "config/axios";
import { ErrorHandler } from "config/ErrorHandler";

export const get = async (endPoint, params) => {
    try {
        const result = await instance.get(endPoint, { params: params });
        if (result.status === 200 || result.status === 206 || result.status === 202) return result.data;
        else throw result;
    } catch (e) {
        throw ErrorHandler(e);
    }
};
export const Statementget = async (endPoint, params) => {
    try {
        const result = await instance.get(endPoint, { params: params });
        if (result.status === 200 || result.status === 206) return result.data;
        else throw result;
    } catch (e) {
        throw (e);
    }
};
export const post = async (endPoint, data) => {
    try {
        const result = await instance.post(endPoint, data);
        if (result.status === 200 || result.status === 206 || result.status === 202) return result.data;
        else throw result;
    } catch (e) {
        throw ErrorHandler(e);
    }
};

export const patch = async (endPoint, data) => {
    try {
        const result = await instance.patch(endPoint, data);
        if (result.status === 200 || result.status === 206) return result.data;
        else throw result;
    } catch (e) {
        throw ErrorHandler(e);
    }
};

export const deleted = async (endPoint, params) => {
    try {
        const result = await instance.delete(endPoint, { params: params });
        if (result.status === 200 || result.status === 206) return result.data;
        else throw result;
    } catch (e) {
        throw ErrorHandler(e);
    }
};