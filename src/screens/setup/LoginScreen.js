import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { width } from '../../utils/Scaling';
import Colors from '../../utils/Colors';
import Toast from 'react-native-root-toast';
import Modal from 'react-native-modal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { StackActions } from '@react-navigation/native';
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../firebase-config';

import StringInput from '../../components/StringInput';

import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgottenEmail, setForgottenEmail] = useState('');

    useEffect(() => {
        // check if the user is already signed in
        onAuthStateChanged(auth, user => {
            if (user) {
                // User is signed in
                // replace the login screen with the home screen
                navigation.dispatch(StackActions.replace('Tab', { screen: 'Home' }));
            }
        })

        const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

        return () => {
            keyboardHideListener.remove();
            keyboardShowListener.remove();
        };
    }, []);

    useEffect(() => {
        // empty string input for forgotten email if the user closes the modal
        setForgottenEmail('');
    }, [modalVisible]);

    function handleLogin () {
        if (email.length == 0) {
            Toast.show('\n Please enter an email \n', {
                backgroundColor: Colors.darkGrey,
                position: Toast.positions.CENTER,
                opacity: 1,
                shadow: false,
                textStyle: { fontSize: width > 550 ? 19 : 16 },
                containerStyle: { borderRadius: 10 }
            });
        } else if (password.length == 0) {
            Toast.show('\n Please enter a password \n', {
                backgroundColor: Colors.darkGrey,
                position: Toast.positions.CENTER,
                opacity: 1,
                shadow: false,
                textStyle: { fontSize: width > 550 ? 19 : 16 },
                containerStyle: { borderRadius: 10 }
            });
        } else {
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                setEmail('');
                setPassword('');
                navigation.navigate('Tab', { screen: 'Home' });
            })
            .catch((error) => {
                let errorMessage;
                if (error.code != undefined) { errorMessage = error.code.slice(5); }
                Toast.show(errorMessage, {
                    backgroundColor: Colors.darkGrey,
                    position: Toast.positions.CENTER,
                    opacity: 1,
                    shadow: false,
                    textStyle: { fontSize: width > 550 ? 19 : 16 },
                    containerStyle: { borderRadius: 10 }
                });
            })
        }
    };

    function handleReset () {
        if (forgottenEmail.length != 0) {
            setModalVisible(false);
            sendPasswordResetEmail(auth, forgottenEmail)
            .then(() => {
                Toast.show('\n Email sent \n', {
                    backgroundColor: Colors.darkGrey,
                    position: Toast.positions.CENTER,
                    opacity: 1,
                    shadow: false,
                    textStyle: { fontSize: width > 550 ? 19 : 16 },
                    containerStyle: { borderRadius: 10 }
                });
            })
            .catch((error) => {
                let errorMessage;
                if (error.code != undefined) { errorMessage = error.code.slice(5); }
                Toast.show(errorMessage, {
                    backgroundColor: Colors.darkGrey,
                    position: Toast.positions.CENTER,
                    opacity: 1,
                    shadow: false,
                    textStyle: { fontSize: width > 550 ? 19 : 16 },
                    containerStyle: { borderRadius: 10 }
                });
            })
        }
    };

    return (
        <View style={styles.screen}>
            <KeyboardAwareScrollView scrollEnabled={false}>
                <Ionicons name='globe-outline' size={width > 550 ? 70 : 50} style={{ alignSelf: 'center', top: 30 }}/>
                <Text style={styles.nameText}>StudyConnect</Text>

                <Text style={[styles.sloganText, { marginTop: width > 550 ? '8%' : '10%' }]}>Facilitating teamwork</Text>
                <Text style={styles.sloganText}>among all students</Text>

                {/* Decide later if I want to allow both email & username as options for log in */}
                <StringInput string={email} label='Email' setText={setEmail} length={30} capitalize='none' inputLayout='email-address' style={{ marginTop: width > 550 ? '10%' : '15%' }}/>
                <StringInput string={password} label='Password' setText={setPassword} length={30} hideText={true} capitalize='none' style={{ marginTop: width > 550 ? '8%' : '10%' }}/>

                <TouchableOpacity
                    style={styles.buttonContainer}
                    onPress={() => handleLogin()}
                >
                    <Text style={{ color: 'white', fontSize: width > 550 ? 23 : 20 }}>Login</Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>

            {keyboardVisible === false ? <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                    style={[styles.extraButtonContainers, { marginLeft: width > 550 ? '15%' : '12%', height: 60 }]}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.extraButtonText}>Forgot</Text>
                    <Text style={styles.extraButtonText}>Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.extraButtonContainers, { marginRight: width > 550 ? '15%' : '12%', height: 60 }]}
                    onPress={() => navigation.navigate('SetupStack', { screen: 'Register' })}
                >
                    <Text style={styles.extraButtonText}>Sign Up</Text>
                </TouchableOpacity>
            </View> : null}

            <Modal
                isVisible={modalVisible}
                onBackButtonPress={() => setModalVisible(false)}
                onBackdropPress={() => setModalVisible(false)}
                animationOutTiming={300}
                backdropTransitionOutTiming={500}
                backdropOpacity={0.55}
            >
                <View style={styles.modalContainer}>
                    <Text style={{ fontSize: width > 550 ? 27 : 22, fontFamily: 'roboto-medium' }}>Reset Your Password</Text>
                    <Text style={styles.descriptionText}>Lost your password? Please enter your email address. You will receive a link to create a new password via email.</Text>
                    <StringInput string={forgottenEmail} label='Email' setText={setForgottenEmail} length={30} capitalize='none' inputLayout='email-address' style={{ marginTop: width > 550 ? 40 : 30, width: '100%' }}/>
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={() => handleReset()}
                    >
                        <Text style={{ color: 'white', fontSize: width > 550 ? 21 : 18 }}>Reset Password</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.theme
    },
    nameText: {
        color: Colors.subTheme,
        fontSize: width > 550 ? 55 : 40,
        fontFamily: 'roboto-medium',
        alignSelf: 'center',
        marginTop: width > 550 ? '10%' : '15%'
    },
    sloganText: {
        fontSize: width > 550 ? 23 : 19,
        textAlign: 'center'
    },
    buttonContainer: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        height: width > 550 ? 65 : 55,
        backgroundColor: Colors.subTheme,
        width: width > 550 ? '70%' : '80%',
        borderRadius: width > 550 ? 30 : 25,
        marginTop: width > 550 ? '8%' : '10%'
    },
    extraButtonContainers: {
        alignItems: 'center',
        justifyContent: 'center',
        bottom: '10%'
    },
    extraButtonText: {
        color: Colors.subTheme,
        fontSize: width > 550 ? 23 : 19,
        fontFamily: 'roboto-medium'
    },
    modalContainer: {
        borderRadius: 20,
        backgroundColor: Colors.theme,
        height: width > 550 ? 430 : 370,
        width: '90%',
        alignSelf: 'center',
        alignItems: 'center',
        paddingTop: 30
    },
    descriptionText: {
        width: '100%',
        marginTop: width > 550 ? 35 : 25,
        paddingHorizontal: width > 550 ? 50 : 30,
        fontSize: width > 550 ? 20 : 17,
        textAlign: 'center'
    },
    resetButton: {
        height: width > 550 ? 65 : 55,
        width: width > 550 ? '50%' : '60%',
        backgroundColor: Colors.subTheme,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: width > 550 ? 30 : 25,
        marginTop: width > 550 ? 40 : 30
    }
});

export default LoginScreen;