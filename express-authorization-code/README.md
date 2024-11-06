# PingOne Express Application with Authorization Code Flow

This express sample application demonstrates how to use the Authorization Code flow to authenticate a user and obtain an access token from PingOne.
Ths application uses the `express` framework to create a simple web application that authenticates a user and displays the user's access token and ID
token after a successful login. This sample application does support PKCE.

## Prerequisites

A PingOne OIDC Web Application must be configured with the following settings:
- Response Type: Code
- Grant Type: Authorization Code
- Redirect URI: http://localhost:3000/callback
- Token Endpoint Authentication Method: Client Secret Basic

After configuring the PingOne OIDC Web Application, you will need to retrieve the code snippet for the .env file:
- Enable the application
- Navigate to the 'Integrate' tab
- Ensure the 'Authorization Code' flow is enabled
- Select 'Express' as the Language/Framework
- Copy the provided code snippet and paste it into the '.env' file of this project.

## Running the Application

To run the application, execute the following commands:
- `npm install` in the express-authorization-code directory
  - This will install the necessary dependencies
- `npm start` in the express-authorization-code directory
  - This will start the application on http://localhost:3000
- Open a browser and navigate to http://localhost:3000
  - This will redirect you to the PingOne login page
  - You will need the credentials of a user in PingOne
    - If you do not have a user, you can visit: https://docs.pingidentity.com/pingone/directory/p1_adduser.html to learn how to create one.
  - After logging in, you will be redirected back to the application with the user's information
  - Signing out will revoke the access token and refresh token

## Disclaimer

THE SAMPLE CODE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SAMPLE CODE OR THE USE OR OTHER DEALINGS IN
THE SAMPLE CODE.  FURTHERMORE, THIS SAMPLE CODE IS NOT COMMERCIALLY SUPPORTED BY PING IDENTITY BUT QUESTIONS MAY BE ADDRESSED TO PING'S SUPPORT CENTER OR MAY BE OTHERWISE ADDRESSED IN THE RELATED DOCUMENTATION.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details