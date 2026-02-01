import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})  
export class ApiBaseService {

    baseUrl = 'http://localhost:5045'; // Backend de .NET
    // baseUrl = 'https://localhost:44338';
    // baseUrl = 'https://192.168.64.3:45455'; // conveyor.cloud para los de mac

    constructor(public http: HttpClient) {
    }

    getHttpOptions(): any {

        const headers = this._getHeaders(/* session?.accessToken */);
        const httpOpts = { headers: new HttpHeaders(headers) };

        return httpOpts;
    }

    private _getHeaders(/* authenticationToken?: string */) {

        const headers = {
            "Cache-Control": "no-cache",
            "Content-Type": "application/json, text/plain, */*", // DEFAULT
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET,POST,UPDATE,DELETE,OPTIONS",
            "Access-Control-Allow-Origin": "*"
        };
        /* if (authenticationToken) {
            headers["Authorization"] = `Bearer ${authenticationToken}`;
        } */
        return headers;
    }

    // Verify if error is string or has an error message
    // Return an error string
    getErrorMsg(resError: any, defaultErrText?: string, showSessionAlert?: boolean): string {

        let errMsg: string = '';
        if (resError) {
            if (typeof resError == "string" && resError.length) {
                errMsg = resError;
            } else if (resError.status == 0 && resError.statusText &&
                resError.statusText.indexOf("Unknown Error") >= 0) {
                errMsg = "Error relacionado con la conexión con el servidor, por favor compruebe su conexión a internet";
                return errMsg;
            } else if (resError.status == 400 && resError.error) {
                if (resError.error.Message) {
                    errMsg = resError.error.Message;
                }
                else if (resError.error.error_description) {
                    errMsg = resError.error.error_description;
                }
                else if (resError.error.error == "invalid_grant") {
                    errMsg = "El usuario o contraseña son inválidos, por favor revisá la información y volvé a intentarlo.";
                    return errMsg;
                }
                else if (resError.error.error == "connecting" || resError.error.error == "Server_internalError") {
                    errMsg = "Error relacionado con la red o una conexión con el servidor, por favor compruebe su conexión a internet";
                    return errMsg;
                }
                else if (typeof resError.error == "string" && resError.error.length) {
                    errMsg = resError.error;
                }
            } else if (resError.status == 401) {
                if (typeof resError.error == "string" && resError.error.length) {
                    errMsg = resError.error;

                    if (resError.error == "Unauthorized") {
                        errMsg = "La sesión ha caducado.";

                        return errMsg;
                    }
                } else if (
                    (resError.error?.message && resError.error?.message.indexOf("Authorization has been denied") >= 0) ||
                    (resError.error?.Message && resError.error?.Message.indexOf("Authorization has been denied") >= 0) ||
                    resError.statusText == "Unauthorized") {
                    errMsg = "La sesión ha caducado.";

                    return errMsg;
                } else if (resError.message) {
                    errMsg = resError.message;
                } else if (resError.Message) {
                    errMsg = resError.Message;
                } else {
                    errMsg = "La sesión ha caducado.";

                    return errMsg;
                }
            } else if (resError.status == 400 && resError.error && typeof resError.error == "string") {
                if (resError.error.indexOf("no está registrado") >= 0) {
                    errMsg = resError.error;
                    return errMsg;
                } else if (resError.error.indexOf("ya existe") >= 0) {
                    errMsg = "Ya existe una cuenta con este email. Por favor regresá a Iniciar Sesión, y en caso de haberla olvidado podés proceder a recuperar tu contraseña.";
                    return errMsg;
                } else if (resError.error.indexOf("es inválido") >= 0) {
                    errMsg = resError.error;
                    return errMsg;
                } else if (resError.error.length) {
                    errMsg = resError.error;
                } else if (resError.message) {
                    errMsg = resError.message;
                } else if (resError.Message) {
                    errMsg = resError.Message;
                }
            } else if (resError.error && resError.error.error_description) {
                errMsg = resError.error.error_description;
            } else if (resError.error && resError.error.message) {
                errMsg = resError.error.message;
            } else if (resError.error && resError.error.Message) {
                errMsg = resError.error.Message;
            } else if (resError.message) {
                errMsg = resError.message;
            }
            // Custom errors
            if (errMsg) {
                if (errMsg.indexOf("Http failure response") >= 0) {
                    errMsg =
                        "El servidor no proceso la información correctamente, por favor compruebe su conexión a internet y volvé a intentarlo.";
                }
                if (errMsg.indexOf("unknown url") >= 0) {
                    errMsg = "No se pudo establecer conexión con el servidor, por favor compruebe su conexión a internet y volvé a intentarlo.";
                }
                if (errMsg.indexOf("AdminDbContext") >= 0) {
                    errMsg = "El servidor no se encuentra disponible, por favor intente en otro momento.";
                }
                if (errMsg.indexOf("EntityValidationErrors") >= 0) {
                    errMsg = "El servidor no proceso la información correctamente, por favor revisá la información y volvé a intentarlo.";
                }
                if (errMsg.indexOf("updating the entries") >= 0) {
                    errMsg = "El servidor no proceso la información correctamente, por favor revisá la información y volvé a intentarlo.";
                }
                if (errMsg.indexOf("The underlying provider failed on Open") >= 0) {
                    errMsg = "El servidor no proceso la información correctamente, por favor volvé a intentarlo.";
                }
            }
        }
        // If not err message, return default error
        if (!errMsg && defaultErrText) {
            return defaultErrText;
        }

        errMsg = errMsg || "Error desconocido.";
        return errMsg;
    }
}
