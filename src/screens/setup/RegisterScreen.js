import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ActionSheetIOS } from 'react-native';
import { width } from '../../utils/Scaling';
import Colors from '../../utils/Colors';
import Toast from 'react-native-root-toast';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useHeaderHeight } from '@react-navigation/elements';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getStorage } from 'firebase/storage';
import { auth, db } from '../../../firebase-config';

import StringInput from '../../components/StringInput';

const RegisterScreen = ({ navigation }) => {
    const headerHeight = useHeaderHeight();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const [username, setUsername] = useState('');
    const [usernameTaken, setUsernameTaken] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (usernameTaken != null) {
            handleRegister();
        }
    }, [usernameTaken]);

    // check if the selected username already exists in the usernames collection
    async function checkUsernameList () {
        const docsSnap = await getDocs(collection(db, 'usernames'));

        /*docsSnap.forEach(doc => {
            if (doc.data().username == username) {
                console.log(doc.data().username);
                return true;
            }
        })*/

        for (let i in docsSnap.docs) {
            const doc = docsSnap.docs[i].data();
            if (doc.username == username ) {
                setUsernameTaken(true);
                return;
            }
        }

        setUsernameTaken(false);
    };

    async function uploadImageAsync (userID) {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
              resolve(xhr.response);
            };
            xhr.onerror = function (e) {
              console.log(e);
              reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", selectedImage, true);
            xhr.send(null);
        });

        let location = 'profileImages/' + userID;
        const fileRef = ref(getStorage(), location);
        const result = await uploadBytes(fileRef, blob);

        blob.close();
    };

    function handleRegister () {
        if (usernameTaken === true) {   // username is taken
            Toast.show('\n Sorry, this username is already taken \n', {
                backgroundColor: Colors.darkGrey,
                position: Toast.positions.CENTER,
                opacity: 1,
                shadow: false,
                textStyle: { fontSize: width > 550 ? 19 : 16 },
                containerStyle: { borderRadius: 10 }
            });
        } else {
            createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                //photoURL  <-- name of data variable for storing a user's profile icon
                //updateProfile(auth.currentUser, { displayName: username, photoURL: <photo_details> })
                updateProfile(auth.currentUser, { displayName: username 
                }).then(() => {
                    // add the display name/username of the new account to my usernames collection
                    const docData = { username: username };
                    addDoc(collection(db, 'usernames'), docData)
                    .then(docRef => {
                        // add the uploaded image to the folder of profile images
                        if (selectedImage != null) {
                            uploadImageAsync(auth.currentUser.uid);
                        }

                        // navigate to the home screen
                        navigation.navigate('Tab', { screen: 'Home' });
                    })
                    .catch(error => console.log(error))
                }).catch(error => console.log(error))
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
                    containerStyle: { borderRadius: 10, height: width > 550 ? 75 : 75, width: 250, justifyContent: 'center' }
                });
            })
        }
        setUsernameTaken(null);
    };

    function checkCredentials () {
        if (username.length == 0) {
            Toast.show('\n Please enter a username \n', {
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
            // check if the entered username is already taken
            checkUsernameList();
        }
    };

    async function pickImage () {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    }

    return (
        <View style={styles.screen}>
            <KeyboardAwareScrollView scrollEnabled={false}>
                <TouchableOpacity
                    style={{ height: width > 550 ? 125 : 90, width: width > 550 ? 125 : 90, alignSelf: 'center', marginTop: headerHeight }}
                    onPress={() => {
                        if (Platform.OS === 'ios') {
                            ActionSheetIOS.showActionSheetWithOptions(
                                {
                                    options: ['Select from Gallery', 'Cancel'],
                                    cancelButtonIndex: 1
                                },
                                buttonIndex => {
                                    if (buttonIndex === 0) { pickImage(); }
                                }
                            )
                        } else { setModalVisible(true); }
                    }}
                >
                    <Image
                        source={selectedImage ? { uri: selectedImage } : require('../../assets/images/addProfileImage.jpg')}
                        style={{ flex: 1, height: undefined, width: undefined, borderRadius: selectedImage ? 65 : 0 }}
                    />
                </TouchableOpacity>

                <Text style={styles.titleText}>Create New Account</Text>

                <StringInput string={username} label='Username' setText={setUsername} length={30} capitalize='none' style={{ marginTop: width > 550 ? '8%' : '10%' }}/>

                {/*<View style={{ flexDirection: 'row', width: '100%', marginTop: width > 550 ? '8%' : '10%' }}>
                    <View style={{ width: width > 550 ? '3%' : '2.5%' }}/>
                    <StringInput string={email} label='Email' setText={setEmail} length={23} capitalize='none' style={{ marginTop: 0, width: width > 550 ? '80%' : '75%' }}/>
                    <View style={{ justifyContent: 'center', right: width > 550 ? '108%' : '43%' }}>
                        <Text style={{ fontSize: width > 550 ? 20 : 17 }}>@uwo.ca</Text>
                    </View>
                </View>*/}

                <StringInput string={email} label='Email' setText={setEmail} length={30} capitalize='none' inputLayout='email-address' style={{ marginTop: width > 550 ? '8%' : '10%' }}/>

                <StringInput string={password} label='Password' setText={setPassword} length={30} capitalize='none' style={{ marginTop: width > 550 ? '8%' : '10%' }}/>

                <Text style={styles.legalText}>By tapping "Confirm" you agree to</Text>
                <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                    <Text style={{ fontSize: width > 550 ? 17 : 15 }}>our</Text>
                    <TouchableOpacity
                        style={{ marginLeft: 5 }}
                        // perhaps navigate to the privacy policy
                        //onPress={() => }
                    >
                        <Text style={{ fontSize: width > 550 ? 17 : 15, color: Colors.subTheme }}>terms & conditions</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.buttonContainer}
                    // write a function for analyzing the variables and comparing them to data on the cloud storage network
                    // ensure that the user's password is at least 6 characters long and use react-native-root-toast to inform them if it isn't
                    onPress={() => checkCredentials()}
                >
                    <Text style={{ color: 'white', fontSize: width > 550 ? 23 : 20 }}>Confirm</Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>

            <Modal
                isVisible={modalVisible}
                onBackButtonPress={() => setModalVisible(false)}
                onBackdropPress={() => setModalVisible(false)}
                onSwipeComplete={() => setModalVisible(false)}
                swipeDirection='down'
                animationOutTiming={300}
                backdropTransitionOutTiming={500}
                backdropOpacity={0.55}
                style={{ justifyContent: 'flex-end', margin: 0 }}
            >
                <View style={styles.modalContainer}>
                    <View style={{ height: 5, width: 45, backgroundColor: 'black', marginTop: 12, alignSelf: 'center', borderRadius: 10 }}/>

                    <TouchableOpacity
                        style={styles.imageModalButton}
                        onPress={() => {
                            setModalVisible(false);
                            pickImage();
                        }}
                    >
                        <Text style={{ fontSize: width > 550 ? 17 : 15, fontFamily: 'roboto-medium' }}>Select from Gallery</Text>
                    </TouchableOpacity>

                    <View style={{ width: '100%', backgroundColor: '#f2f2f2', height: 7 }}/>

                    <TouchableOpacity
                        style={[styles.imageModalButton, { borderBottomWidth: 0 }]}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={{ fontSize: width > 550 ? 17 : 15, color: '#666666' }}>Cancel</Text>
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
    titleText: {
        alignSelf: 'center',
        fontSize: width > 550 ? 28 : 25,
        marginTop: width > 550 ? 40 : 35,
        fontFamily: 'roboto-medium'
    },
    legalText: {
        alignSelf: 'center',
        marginTop: width > 550 ? 40 : 35,
        fontSize: width > 550 ? 17 : 15
    },
    buttonContainer: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        height: width > 550 ? 65 : 55,
        backgroundColor: Colors.subTheme,
        width: width > 550 ? '70%' : '80%',
        borderRadius: width > 550 ? 30 : 25,
        marginTop: width > 550 ? '6%' : '8%'
    },
    modalContainer: {
        backgroundColor: Colors.theme,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    imageModalButton: {
        backgroundColor: Colors.theme,
        height: width > 550 ? 65 : 55,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomColor: '#f2f2f2',
        borderBottomWidth: 1
    }
});

export default RegisterScreen;