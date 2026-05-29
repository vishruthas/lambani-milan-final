import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoAccessToken
} from "amazon-cognito-identity-js";

/* CONFIG */
const poolData = {
  UserPoolId: "ap-south-1_xaL8SY8C0",
  ClientId: "7jeglp61pukv1g1ma1b1ukc0q"
};

const userPool = new CognitoUserPool(poolData);

/* FORMAT IDENTIFIER */
function formatIdentifier(identifier) {
  const isPhone = /^[0-9]{10}$/.test(identifier);
  return isPhone ? `+91${identifier}` : identifier;
}

/* GET USER TYPE */
export function getUserType() {
  const username = localStorage.getItem("username") || "";
  return username.startsWith("+91") ? "phone" : "email";
}

/* CURRENT USER */
function getCurrentUserSafe() {
  return new Promise((resolve, reject) => {
    const user = userPool.getCurrentUser();

    if (!user) return reject("User not logged in");

    user.getSession((err, session) => {
      if (err || !session?.isValid()) {
        return reject("Session expired");
      }
      resolve(user);
    });
  });
}

/* SIGNUP */
export function signup(identifier, password) {
  return new Promise((resolve, reject) => {
    const formatted = formatIdentifier(identifier);
    const attributes = [];

    if (formatted.startsWith("+91")) {
      attributes.push(
        new CognitoUserAttribute({
          Name: "phone_number",
          Value: formatted
        })
      );
    } else {
      attributes.push(
        new CognitoUserAttribute({
          Name: "email",
          Value: formatted
        })
      );
    }

    userPool.signUp(formatted, password, attributes, null, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/* CONFIRM SIGNUP */
export function confirmSignup(identifier, code) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: formatIdentifier(identifier),
      Pool: userPool
    });

    user.confirmRegistration(code, true, err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/* LOGIN */
export function login(identifier, password) {
  return new Promise((resolve, reject) => {
    const formatted = formatIdentifier(identifier);

    const user = new CognitoUser({
      Username: formatted,
      Pool: userPool
    });

    user.setAuthenticationFlowType("USER_PASSWORD_AUTH");

    const authDetails = new AuthenticationDetails({
      Username: formatted,
      Password: password
    });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        localStorage.setItem(
          "id_token",
          session.getIdToken().getJwtToken()
        );

        localStorage.setItem(
          "access_token",
          session.getAccessToken().getJwtToken()
        );

        localStorage.setItem("username", formatted);

        resolve(session);
      },
      onFailure: err => reject(err)
    });
  });
}

/* RESEND OTP */
export function resendSignupOtp(identifier) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: formatIdentifier(identifier),
      Pool: userPool
    });

    user.resendConfirmationCode((err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/* FORGOT PASSWORD */
export function forgotPassword(username) {
  const user = new CognitoUser({
    Username: formatIdentifier(username),
    Pool: userPool
  });

  return new Promise((resolve, reject) => {
    user.forgotPassword({
      onSuccess: resolve,
      onFailure: reject
    });
  });
}

/* CONFIRM NEW PASSWORD */

export function confirmNewPassword(username, code, newPassword) {
  const user = new CognitoUser({
    Username: formatIdentifier(username),
    Pool: userPool
  });

  return new Promise((resolve, reject) => {
    user.confirmPassword(code, newPassword, {
      onSuccess: resolve,
      onFailure: reject
    });
  });
}

/* GET CURRENT EMAIL 
export async function getCurrentUserEmail() {
  const user = await getCurrentUserSafe();

  return new Promise((resolve, reject) => {
    user.getUserAttributes((err, attributes) => {
      if (err) return reject(err);

      const emailAttr = attributes.find(
        (attr) => attr.getName() === "email"
      );

      resolve(emailAttr?.getValue() || "");
    });
  });
} */
export async function getCurrentUserEmail() {
  const user = await getCurrentUserSafe();

  return new Promise((resolve, reject) => {
    user.getUserAttributes((err, attributes) => {
      if (err) return reject(err);

      const emailAttr = attributes.find(
        (attr) => attr.getName() === "email"
      );

      const verifiedAttr = attributes.find(
        (attr) => attr.getName() === "email_verified"
      );

      const isVerified =
        verifiedAttr?.getValue() === "true";

      // if verified show new email
      if (isVerified) {
        resolve(emailAttr?.getValue() || "");
      } else {
        // otherwise show old logged in email
        resolve(localStorage.getItem("username") || "");
      }
    });
  });
}

/* GET CURRENT PHONE 
export async function getCurrentUserPhone() {
  const user = await getCurrentUserSafe();

  return new Promise((resolve, reject) => {
    user.getUserAttributes((err, attributes) => {
      if (err) return reject(err);

      const phoneAttr = attributes.find(
        (attr) => attr.getName() === "phone_number"
      );

      resolve(phoneAttr?.getValue() || "");
    });
  });
} */
export async function getCurrentUserPhone() {
  const user = await getCurrentUserSafe();

  return new Promise((resolve, reject) => {
    user.getUserAttributes((err, attributes) => {
      if (err) return reject(err);

      const phoneAttr = attributes.find(
        (attr) => attr.getName() === "phone_number"
      );

      const verifiedAttr = attributes.find(
        (attr) => attr.getName() === "phone_number_verified"
      );

      const isVerified =
        verifiedAttr?.getValue() === "true";

      // show new phone only after verification
      if (isVerified) {
        resolve(phoneAttr?.getValue() || "");
      } else {
        resolve(localStorage.getItem("username") || "");
      }
    });
  });
}

/* UPDATE EMAIL */
export async function updateEmail(newEmail) {
  const user = await getCurrentUserSafe();

  return new Promise((resolve, reject) => {
    const attribute = new CognitoUserAttribute({
      Name: "email",
      Value: newEmail
    });

    user.updateAttributes([attribute], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/* VERIFY EMAIL OTP */
export async function verifyEmailOtp(code) {
  const user = await getCurrentUserSafe();

  return new Promise((resolve, reject) => {
    user.verifyAttribute("email", code, {
      onSuccess: resolve,
      onFailure: reject
    });
  });
}

/* UPDATE PHONE */
export async function updatePhoneNumber(phone) {
  const user = await getCurrentUserSafe();

  return new Promise((resolve, reject) => {
    const attribute = new CognitoUserAttribute({
      Name: "phone_number",
      Value: `+91${phone}`
    });

    user.updateAttributes([attribute], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/* VERIFY PHONE OTP */
export async function verifyPhoneOtp(code) {
  const user = await getCurrentUserSafe();

  return new Promise((resolve, reject) => {
    user.verifyAttribute("phone_number", code, {
      onSuccess: resolve,
      onFailure: reject
    });
  });
}

/* CHANGE PASSWORD */
export async function changePassword(oldPassword, newPassword) {
  const user = await getCurrentUserSafe();

  return new Promise((resolve, reject) => {
    user.changePassword(oldPassword, newPassword, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/* LOGOUT */
export function logout() {
  const user = userPool.getCurrentUser();
  if (user) user.signOut();

  localStorage.removeItem("access_token");
  localStorage.removeItem("id_token");
  localStorage.removeItem("username");
}

/* SIGN OUT AFTER PASSWORD CHANGE */
export async function globalSignOut() {
  const user = await getCurrentUserSafe();

  return new Promise((resolve, reject) => {
    user.globalSignOut({
      onSuccess: resolve,
      onFailure: reject
    });
  });
}

/* CHECK EMAIL VERIFIED */
export async function isEmailVerified() {

  const user = userPool.getCurrentUser();

  if (!user) return false;

  return new Promise((resolve) => {

    user.getSession((err) => {

      if (err) {
        resolve(false);
        return;
      }

      user.getUserAttributes((err, attributes) => {

        if (err || !attributes) {
          resolve(false);
          return;
        }

        const verifiedAttr = attributes.find(
          (attr) => attr.getName() === "email_verified"
        );

        resolve(
          verifiedAttr?.getValue() === "true"
        );
      });
    });
  });
}

/* CHECK PHONE VERIFIED */
export async function isPhoneVerified() {

  const user = userPool.getCurrentUser();

  if (!user) return false;

  return new Promise((resolve) => {

    user.getSession((err) => {

      if (err) {
        resolve(false);
        return;
      }

      user.getUserAttributes((err, attributes) => {

        if (err || !attributes) {
          resolve(false);
          return;
        }

        const verifiedAttr = attributes.find(
          (attr) => attr.getName() === "phone_number_verified"
        );

        resolve(
          verifiedAttr?.getValue() === "true"
        );
      });
    });
  });
}