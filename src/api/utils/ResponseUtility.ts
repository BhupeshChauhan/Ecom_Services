import { createCors } from "./createCors";


const { preflight, corsify } = createCors()


export class ResponseUtility {
    static async ok(data: any = {}, message: string = "Success"): Promise<Response> {
      const responseBody = {
        status: "success",
        message,
        data
      };
     
      return ResponseUtility.buildResponse(responseBody,200 );
    }
  
    static buildResponse(responseBody: { status: string; message: string; data: any; }, statuscode: number) {

      const response = new Response(JSON.stringify(responseBody), { status: statuscode});//,statuscode );
      response.headers.set('Access-Control-Allow-Origin', '*'); // This allows any origin, be cautious with this in a production environment.
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

      return corsify(response);
    }

    static async created(data: any = {}, message: string = "Resource created"): Promise<Response> {
      const responseBody = {
        status: "success",
        message,
        data
      };
      return ResponseUtility.buildResponse(responseBody, 201 );
    }

    static async unauthorized(message: string = "Unauthorized"): Promise<Response> {
      const responseBody = {
        status: "fail",
        message,
        data: ""
      };
    
      return ResponseUtility.buildResponse(responseBody, 401 );
    }

    static async sessionExpired(message: string = "Session Expired"): Promise<Response> {
      const responseBody = {
        status: "fail",
        message,
        data: ""
      };
    
      return ResponseUtility.buildResponse(responseBody, 440 );
    }
    
  
    static async badRequest(message: string = "Bad Request"): Promise<Response> {
      const responseBody = {
        status: "fail",
        message,
        data: ""
      };

      return ResponseUtility.buildResponse(responseBody,  400 );
    }
  
  
    static async notFound(message: string = "Resource not found"): Promise<Response> {
      const responseBody = {
        status: "fail",
        message,
        data: ""
      };
      return ResponseUtility.buildResponse(responseBody, 404 );
    }
  
    static async internalServerError(message: string = "Internal Server Error"): Promise<Response> {
      const responseBody = {
        status: "error",
        message,
        data:""
      };
      return ResponseUtility.buildResponse(responseBody, 500 );
    }
}
