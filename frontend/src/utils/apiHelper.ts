export const getErrorMessage = (error: any): string => {
    if (error.response && error.response.data && error.response.data.message) {
        return error.response.data.message;
    }
    if (error.response && error.response.data && error.response.data.error) {
        return error.response.data.error;
    }
    if (error.message) {
        return error.message;
    }
    return "Something went wrong. Please try again.";
};
