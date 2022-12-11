import React, {useState} from "react";
import {
    Flex,
    Spacer,
    Image,
    Box,
    Heading,
    FormControl,
    FormErrorMessage,
    Input,
    Button,
    Text,
    Container,
    InputGroup,
    InputRightElement,
    FormHelperText
} from "@chakra-ui/react";
import turuIcon from "../../Assets/image/turuIcon.png";
import google from "../../Assets/image/google.png";
import facebook from "../../Assets/image/facebook.png";
import loginImage from "../../Assets/image/loginImage.png";
import {Formik, useFormik} from "formik"
import * as Yup from "yup"
import YupPassword from "yup-password"
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    sendEmailVerification,
    signInWithEmailAndPassword
} from "firebase/auth";
import {authFirebase} from "../../Config/firebase";
import axios from "axios"
import {useDispatch} from "react-redux";
import auth_types from "../../Redux/Reducers/Types/userTypes";
import {Link, useHistory} from "react-router-dom";
import Layout from "../../Components/Layout";

function LoginUser() {

    // for toggling password visibility
    const [showPassword, setShowPassword] = useState(false)
    const handleClick = () => {
        setShowPassword(!showPassword)
    }

    const history = useHistory()
    const dispatch = useDispatch()

    const handleWithGoogle = async () => {
        const providerGoogle = new GoogleAuthProvider()
        const credential = await signInWithPopup(authFirebase, providerGoogle)

        const user = credential.user

        await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/get-by-id`, {
            params: {id: user.uid}
        })
            .then((res) => {
                console.log(res.data.result)
                dispatch({
                    type: auth_types.Login,
                    payload: res.data.result
                })
                history.push("/")
            })
            .catch((err) => {
                console.log(err)
                alert("please registered your account in form register")
                history.push("/register")
            })
    }

    const handleWithFacebook = async () => {
        const providerFacebook = new FacebookAuthProvider()
        const credential = await signInWithPopup(authFirebase, providerFacebook)

        const user = await credential.user


        // utk redux
        await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/get-by-id`, {
            params: {
                id: user.uid,
            }
        })
            .then((res) => {
                dispatch({
                    type: auth_types.Login,
                    payload: res.data.result
                })
                history.push("/")
            })
            .catch((err) => {
                alert("please registered your account in form register")
                history.push("/register")
            })
    }

    YupPassword(Yup)
    const formik = useFormik({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: Yup.object().shape({
            email: Yup.string().required("your email is invalid").email("input your email"),
            password: Yup.string().required("please fill in the password")
        }),
        validateOnChange: false,
        onSubmit: async (values) => {
            const {email, password} = values

            const userCredential = await signInWithEmailAndPassword(authFirebase, email, password)
            const user = userCredential.user

            // utk get data ke back-end dan di simpan di redux
            const response = axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/getById`, {
                params: {id: user.uid}
            })

            if (response.data.code !== 200) {
                alert("please register for your account")
            } else {
                dispatch({
                    type: auth_types.Login,
                    payload: response.data.result
                })
                history.push("/")
            }
        }
    })

    return (
        <Layout>
            <Container maxW="2x1" px="0px">
                <Flex flexDirection="column">
                    {/* flex container utk dekstop */}
                    <Flex>
                        {/* utk image dekstop */}
                        <Box
                            width="900px"
                            display={{ss: "none", sm: "none", md: "block"}}
                        >
                            <Flex>
                                <Image
                                    // display={{ ss:"none", sm:"none", sl:"none", md:"block", lg:"block"}}
                                    src={loginImage}
                                    width="900px"
                                    height="1080px"
                                    objectFit="cover"
                                    overflow="hidden"
                                />
                            </Flex>
                        </Box>

                        {/* Form */}
                        <Box w="50em">
                            <Flex justifyContent="center" alignItems="center" my="3em">
                                <Box width="360px" height="297px">
                                    <Flex
                                        flexDirection="column"
                                        justifyContent="center"
                                        alignItems="center"
                                        pt="19px"
                                        pb="10px"
                                    >
                                        <Image
                                            src={turuIcon}
                                            alt="turu-icon"
                                            width="59px"
                                            height="58px"
                                        />
                                        <Heading as="h1" size="md" m="10px">
                                            Welcome to Turu
                                        </Heading>
                                    </Flex>
                                    <Flex justifyContent="center" alignItems="center">
                                        <Box width="320px" height="427px">
                                            <Flex flexDirection="column" alignItems="center">
                                                <FormControl id="email" pb="12px">
                                                    <Input
                                                        type="email"
                                                        placeholder="Email/Phone number"
                                                        borderRadius="0"
                                                        // onChange={(e) => inputHandler(e, "email")}
                                                        onChange={(e) => formik.setFieldValue("email", e.target.value)}
                                                    />
                                                    {formik.errors.email ?
                                                        <FormHelperText color="red" textAlign="center">
                                                            {formik.errors.email}
                                                        </FormHelperText>
                                                        :
                                                        null
                                                    }
                                                </FormControl>
                                                <FormControl id="password" pb="15px">
                                                    <InputGroup>
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Password"
                                                            borderRadius="0"
                                                            // onChange={(e) => inputHandler(e, "password")}
                                                            onChange={(e) => formik.setFieldValue("password", e.target.value)}
                                                        />
                                                        <InputRightElement>
                                                            <Button onClick={handleClick}>
                                                                <i className={showPassword ?"fa-sharp fa-solid fa-eye":"fa-solid fa-eye-slash"}/>
                                                            </Button>
                                                        </InputRightElement>

                                                    </InputGroup>
                                                    {formik.errors.password ?
                                                        <FormHelperText color="red" textAlign="center">
                                                            {formik.errors.password}
                                                        </FormHelperText>
                                                        :
                                                        null
                                                    }
                                                </FormControl>

                                                <Button
                                                    variant="primary"
                                                    mb="12px"
                                                    // onClick={handleWithEmailPassword}
                                                    onClick={formik.handleSubmit}
                                                >
                                                    Login
                                                </Button>
                                            </Flex>
                                            <Flex justifyContent="space-between" mx="10px" mb="16px">
                                                <Text
                                                    fontSize="12px"
                                                    fontWeight="300"
                                                    cursor="pointer"
                                                    _hover={{textDecoration: "underline"}}
                                                >
                                                    <Link to="/forgot-password">Forgot Password</Link>
                                                </Text>
                                                <Text
                                                    fontSize="12px"
                                                    fontWeight="300"
                                                    cursor="pointer"
                                                    _hover={{textDecoration: "underline"}}
                                                >
                                                    <Link to="/tenant/login">Login as Tenant</Link>
                                                </Text>
                                            </Flex>
                                            <hr/>
                                            <Button variant="secondary" mt="20px" onClick={handleWithGoogle}
                                                    leftIcon={<Image src={google} mr="5px"></Image>}>
                                                Login With Google
                                            </Button>
                                            <Button variant="secondary" mt="20px" onClick={handleWithFacebook}
                                                    leftIcon={<Image src={facebook}></Image>}>
                                                Login With Facebook
                                            </Button>
                                            <Flex
                                                display="flex"
                                                justifyContent="center"
                                                border="1px"
                                                borderColor="gray.200"
                                                mt="20px"
                                            >
                                                <Flex
                                                    justifyContent="center"
                                                    alignItems="center"
                                                    height="37px"
                                                    width="205px"
                                                >
                                                    <Text fontSize="12px" fontWeight="300" pr="5px">
                                                        Dont have an account?
                                                    </Text>
                                                    <Text
                                                        fontSize="12px"
                                                        fontWeight="300"
                                                        _hover={{
                                                            textDecoration: "underline",
                                                            fontWeight: "bold",
                                                        }}
                                                        cursor="pointer"
                                                    >
                                                        <Link to="/register">Join Turu</Link>
                                                    </Text>
                                                </Flex>
                                            </Flex>
                                        </Box>
                                    </Flex>
                                </Box>
                            </Flex>
                        </Box>
                    </Flex>
                </Flex>
            </Container>
        </Layout>
    );
}

export default LoginUser;
