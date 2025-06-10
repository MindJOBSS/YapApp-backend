import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { loginSchema, signSchema } from "../validators/user.validator";
import { User } from "../database/models/user.model";
import bcrypt from "bcrypt";
import jwt, {  VerifyErrors } from "jsonwebtoken";

const signup = expressAsyncHandler(async (req: Request, res: Response) => {
    const body = req.body;
    signSchema.parse(body);

    const user = await User.findOne({ email: body.email }).lean().exec()

    if(user) {
        res.status(409).json({ message: "User already exists" });
        return;
    }

    const hashedPwd = await bcrypt.hash(body.password, 10);

    const newUser = await User.create({
        email: body.email,
        password: hashedPwd,
        fullName: body.fullName,
        profilePic: body.profilePic,
    });

    if (newUser) {
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    email: newUser.email,
                    fullName: newUser.fullName,
                },
            },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        )

        const refreshToken = jwt.sign(
            { email: newUser.email },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "1d" }
        )

        res.cookie("jwt"
            , refreshToken,
            {
                httpOnly: true,
                sameSite: "none",
                secure: !(process.env.NODE_ENV === "production"),
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            }
        )
        res.status(201).json({
          message: `New user ${newUser.fullName} created`,
          accessToken,
          user: {
            id: newUser._id,
            email: newUser.email,
            fullName: newUser.fullName,
            profilePic: newUser.profilePic,
          },
        });
    } else {
        res.status(400).json({ message: "Invalid user data" });
        return
    }
    return
})

const login = expressAsyncHandler(async (req: Request, res: Response) => {

    const body = req.body;
    loginSchema.parse(body);

    const cookie = req.cookies
    if (cookie?.jwt) {
        res.clearCookie("jwt", {
          httpOnly: true,
          sameSite: "none",
          secure:!(process.env.NODE_ENV === "development"),
        });
    }

    const user = await User.findOne({ email: body.email }).lean().exec()

    if (!user) {
        res.status(401).json({ message: "No users found" });
        return;
    }

    const isPasswordCorrect = await bcrypt.compare(body.password, user.password as string);

    if (!isPasswordCorrect) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }

    const accessToken = jwt.sign(
        {
            UserInfo: {
                email: user.email,
                fullName: user.fullName,
                id: user._id,
            },
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "15m" }
    )

    const refreshToken = jwt.sign(
        { email: user.email },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "1d" }
    )

    res.cookie("jwt"
        , refreshToken,
        {
            httpOnly: true,
            sameSite: "none",
            secure: !(process.env.NODE_ENV === "production"),
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        }
    )

    res.status(200).json({
        message: `Welcome back ${user.fullName}`,
        accessToken,
        user: {
            id : user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic,
        },
    });
    return
})

const logout = (req: Request, res: Response): void => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    res.sendStatus(204);
    return;
  } 
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure:!(process.env.NODE_ENV === "development")
  });
  res.status(204).json({ message: "Cookie cleared" });
  return;
};

const refresh = expressAsyncHandler(async (req: Request, res: Response) => {
    const cookie = req.cookies;
    if (!cookie?.jwt) {
        res.sendStatus(401);
        return;
    } 
    const refreshToken = cookie.jwt
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
        async (err : VerifyErrors | null, decoded: any) => {
            if (err) {
                res.status(403).json({ message: "Forbidden" });
                return;
            }
            const user = await User.findOne({ email: decoded.email }).lean().exec()
            if (!user) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const accessToken = jwt.sign(
                {
                    UserInfo: {
                        email: user.email,
                        fullName: user.fullName,
                        id: user._id,
                    },
                },
                process.env.ACCESS_TOKEN_SECRET as string,
                { expiresIn: "15m" }
            );
            res.status(200).json({
                message: "Token refreshed",
                accessToken,
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                },
            });
            return
        }

    )
    return
})

const checkAuth = (req: Request, res: Response): void => {
    const cookie = req.cookies;
    if (!cookie?.jwt) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const refreshToken = cookie.jwt;
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
        (err: VerifyErrors | null, decoded: any) => {
        if (err) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        res.status(200).json({
            message: "Authenticated",
            user: {
            email: decoded.email,
                fullName: decoded.fullName,
                id: decoded.id,
            },
        });
        return;
        }
    );
}

export {signup,login,logout,refresh,checkAuth}