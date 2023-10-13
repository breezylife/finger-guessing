import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { firebaseAuth, firestore } from "firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useCookies } from "react-cookie";
import { UserContext } from "App";
import { doc, getDoc } from "firebase/firestore";

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

const SigninPage: React.FC = () => {
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies();
  const userContext = useContext(UserContext);

  useEffect(() => {
    if (cookies.idToken) {
      navigate("/");
    }
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userName = data.get("userName") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    signInWithEmailAndPassword(firebaseAuth, email, password)
      .then(async (userCredential) => {
        const userRef = doc(firestore, "users", userCredential.user.uid);
        const userDocSnap = await getDoc(userRef);

        userCredential.user.getIdToken().then((idToken) => {
          setCookie("idToken", {
            userName: userDocSnap.data()?.userName,
            idToken,
            userId: userCredential.user.uid,
            selectedRoomId: userDocSnap.data()?.selectedRoomId,
            playerId: userDocSnap.data()?.playerId,
          });
        });
        userContext?.setUserInfo({
          userName: userDocSnap.data()?.userName,
          userId: userCredential.user.uid,
        });
        navigate("/");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
      });
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            {/* <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="userName"
                label="User Name"
                name="userName"
                autoComplete="family-name"
              />
            </Grid> */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            {/* <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            /> */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/signup" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
};

export default SigninPage;
