import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, Image, Platform, BackHandler, ActionSheetIOS, Dimensions } from 'react-native';
import { width } from '../../utils/Scaling';
import Colors from '../../utils/Colors';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import { HeaderBackButton } from '@react-navigation/elements';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { auth } from '../../../firebase-config';

import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

// profile details to change: (verify later which ones I can/can't modify)
// profile picture (done)
// username
// email
// password
// delete profile

const EditProfileScreen = ({ navigation }) => {
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedInput, setSelectedInput] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // profile details
    const [username, setUsername] = useState(auth.currentUser.displayName);
    const [email, setEmail] = useState(auth.currentUser.email);
    const [tempUsername, setTempUsername] = useState(auth.currentUser.displayName);
    //const [tempEmail, setTempEmail] = useState(auth.currentUser.email);
    //const [password, setPassword] = useState(auth.currentUser.password);

    // set the selectedImage value to the user's profile image
    useEffect(() => {
        // check if any profile images have a name identical to the user's ID
        let location = 'profileImages/' + auth.currentUser.uid;
        getDownloadURL(ref(getStorage(), location))
        .then((url) => {
            setSelectedImage(url);
        }).catch(error => {
            // profile doesn't have a saved profile image
            // therefore, keep the selectedImage value as null
        })
    }, []);

    // setup the back button listener for Android
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [selectedInput]);

    // update header based on the selected input value
    useEffect(() => {
        let titleText;
        let leftOption;
        let rightOption;

        if (selectedInput === null) {
            titleText = 'Edit profile';
            leftOption = <HeaderBackButton
                onPress={() => navigation.goBack()}
                tintColor='black'
            />
        } else if (selectedInput === 'Username') {
            titleText = 'Username';
            leftOption = <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedInput(null)}
            >
                <Ionicons name='close' size={width > 550 ? 30 : 28} color='black'/>
            </TouchableOpacity>
            rightOption = <TouchableOpacity
                style={{ marginRight: 20 }}
                onPress={() => {
                    updateProfile(auth.currentUser, { displayName: tempUsername }); // <-- works (but doesn't update Firestore username data)
                    setUsername(tempUsername);
                }}
            >
                <Text style={{ fontSize: width > 550 ? 20 : 18, fontFamily: 'roboto-medium', color: Colors.subTheme }}>Save</Text>
            </TouchableOpacity>
        }

        if (selectedInput === 'ProfileImage') {
            navigation.setOptions({
                headerStyle: {
                    backgroundColor: 'black',
                    borderBottomWidth: 0,
                    shadowOpacity: 0,
                    elevation: 0
                }
            });
        } else {
            navigation.setOptions({
                title: titleText,
                headerLeft: () => ( leftOption ),
                headerRight: () => ( rightOption ),
                headerStyle: {
                    backgroundColor: Colors.theme,
                    borderBottomWidth: 0.4,
                    shadowOpacity: 0,
                    elevation: 0
                }
            });
        }
    }, [selectedInput]);

    function backAction () {
        if (selectedInput === null) { navigation.goBack(); }
        else { setSelectedInput(null); }
        return true;
    };

    async function uploadImageAsync (uri) {
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
            xhr.open("GET", uri, true);
            xhr.send(null);
        });

        // an image will automatically replace another image with an identical name in the Storage
        let location = 'profileImages/' + auth.currentUser.uid;     // name profile images based on user ID
        const fileRef = ref(getStorage(), location);
        const result = await uploadBytes(fileRef, blob);
        
        blob.close();   // we're done with the blob, close and release it
    
        return await getDownloadURL(fileRef);
    };

    async function pickImage () {
        // don't include the option to use the device's camera since it will require extra permissions (i.e., extra work)
        // one can easily take a picture outside of the app and then use the picture they took

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],     // [width, height]
            quality: 1      // if value is less than 1, image is compressed and file size is reduced, but so is its quality
        });

        if (!result.canceled) {
            const uploadUrl = await uploadImageAsync(result.assets[0].uri);
            setSelectedImage(uploadUrl);
        }
    };

    const UsernameChange = () => {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignSelf: 'center', marginTop: 20, width: width > 550 ? '90%' : '85%', alignItems: 'center' }}>
                    <TextInput
                        value={tempUsername}
                        onChangeText={setTempUsername}
                        selectionColor={Colors.subTheme}
                        maxLength={30}
                        style={{ fontSize: width > 550 ? 20 : 18, fontFamily: 'roboto-medium', height: 40, flex: 1 }}
                    />
                    <TouchableOpacity
                        onPress={() => setTempUsername('')}
                        style={{ marginRight: 5 }}
                    >
                        <AntDesign name='closecircle' size={ width > 550 ? 30 : 20 } color={Colors.lightGrey}/>
                    </TouchableOpacity>
                </View>
                <View style={{ alignSelf: 'center', width: width > 550 ? '90%' : '85%', borderBottomWidth: 1, marginTop: 5 }}/>
                <View style={{ alignSelf: 'center', width: width > 550 ? '90%' : '85%' }}>
                    <Text style={{ fontSize: width > 550 ? 17 : 15, color: '#808080', marginTop: 15 }}>{tempUsername.length}/30</Text>
                    <Text style={{ fontSize: width > 550 ? 17 : 15, color: '#808080', marginTop: 15 }}>Usernames can contain only letters, numbers, underscores, and periods.</Text>
                </View>
            </View>
        );
    };

    const DisplayProfileImage = () => {
        const { width } = Dimensions.get('window');
        return (
            <TouchableWithoutFeedback
                onPress={() => setSelectedInput(null)}
            >
                <View style={{ flex: 1, backgroundColor: selectedImage && 'black', alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                        source={selectedImage ? { uri: selectedImage } : require('../../assets/images/profile-outline.png')}
                        style={{ width: width, height: width }}
                    />
                </View>
            </TouchableWithoutFeedback>
        );
    };

    const InputContainer = (option) => {
        let displayText;
        let label = option;
        let fontColor = 'black';

        if (option === 'Username') { displayText = username; }
        else if (option === 'Email') { displayText = email; }
        else if (option === 'Pronouns') {
            displayText = 'Add pronouns';
            fontColor = '#737373';
        } else if (option === 'Bio') { 
            displayText = 'Add a bio';
            fontColor = '#737373';
        }

        return (
            <TouchableOpacity
                onPress={() => {
                    if (option === 'Username') {
                        setTempUsername(username);
                        setSelectedInput('Username');
                    } else if (option === 'Email') {
                        //setSelectedInput('Email');
                    }
                }}
            >
                <View style={[styles.inputContainer, { marginTop: option === 'Username' ? 25 : width > 550 ? '8%' : '10%' }]}>
                    <Text style={{ fontSize: width > 550 ? 20 : 17, color: fontColor }}>{displayText}</Text>
                </View>
                <Text style={[styles.label, { top: option === 'Username' ? 15 : width > 550 ? 38 : 28, color: fontColor}]}>{'  ' + label + '  '}</Text>
            </TouchableOpacity>
        );
    };

    const AccountInformation = () => {
        return (
            <View style={{ flex: 1 }}>
                <TouchableOpacity
                    style={styles.profilePictureContainer}
                    onPress={() => {
                        if (Platform.OS === 'ios') {
                            ActionSheetIOS.showActionSheetWithOptions(
                                {
                                    options: ['Select from Gallery', 'View photo', 'Cancel'],
                                    cancelButtonIndex: 2,
                                },
                                buttonIndex => {
                                    if (buttonIndex === 0) { pickImage(); } 
                                    else if (buttonIndex === 1) { setSelectedInput('ProfileImage'); }
                                }
                            )
                        } else { setImageModalVisible(true); }
                    }}
                >
                    <Image
                        source={selectedImage ? { uri: selectedImage } : require('../../assets/images/profile-outline.png')}
                        style={{ flex: 1, height: undefined, width: undefined, borderRadius: 65 }}
                    />
                    <View style={styles.pictureOverlay}/>
                    <View style={[styles.pictureOverlay, { backgroundColor: null, opacity: 1, alignItems: 'center', justifyContent: 'center' }]}>
                        <Feather name='camera' size={width > 550 ? 35 : 30} color='white' style={{ position: 'absolute' }}/>
                    </View>
                </TouchableOpacity>
                <Text style={{ alignSelf: 'center', fontSize: width > 550 ? 18 : 15, marginTop: 10 }}>Change photo</Text>

                <Text style={{ marginLeft: '12%', color: '#737373', fontFamily: 'roboto-medium', fontSize: width > 550 ? 18 : 15, marginTop: 25 }}>About you</Text>

                {InputContainer('Username')}
                {InputContainer('Email')}
                {InputContainer('Pronouns')}
                {InputContainer('Bio')}

                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{ marginBottom: 20, backgroundColor: '#e6e6e6', height: 50, width: 180, alignItems: 'center', justifyContent: 'center', borderRadius: 25}}
                        onPress={() => setDeleteModalVisible(true)}
                    >
                        <Text style={{ fontSize: width > 550 ? 18 : 16, fontFamily: 'roboto-medium', color: '#F23F45' }}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const DisplayOptions = () => {
        let displayUI;

        if (selectedInput === null) {
            displayUI = AccountInformation();
        } else if (selectedInput === 'ProfileImage') {
            displayUI = DisplayProfileImage();
        } else if (selectedInput === 'Username') {
            displayUI = UsernameChange();
        }

        return (
            <View style={{ flex: 1 }}>{displayUI}</View>
        );
    };

    return (
        <View style={styles.screen}>
            {DisplayOptions()}
            
            <Modal
                isVisible={imageModalVisible}
                onBackButtonPress={() => setImageModalVisible(false)}
                onBackdropPress={() => setImageModalVisible(false)}
                onSwipeComplete={() => setImageModalVisible(false)}
                swipeDirection='down'
                animationOutTiming={300}
                backdropTransitionOutTiming={500}
                backdropOpacity={0.55}
                style={{ justifyContent: 'flex-end', margin: 0 }}
            >
                <View style={styles.imageModalContainer}>
                    <View style={{ height: 5, width: 45, backgroundColor: 'black', marginTop: 12, alignSelf: 'center', borderRadius: 10 }}/>

                    <TouchableOpacity
                        style={styles.imageModalButton}
                        onPress={() => {
                            setImageModalVisible(false);
                            pickImage();
                        }}
                    >
                        <Text style={{ fontSize: width > 550 ? 17 : 15, fontFamily: 'roboto-medium' }}>Select from Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.imageModalButton}
                        onPress={() => {
                            setImageModalVisible(false);
                            setSelectedInput('ProfileImage');
                        }}
                    >
                        <Text style={{ fontSize: width > 550 ? 17 : 15, fontFamily: 'roboto-medium' }}>View photo</Text>
                    </TouchableOpacity>

                    <View style={{ width: '100%', backgroundColor: '#f2f2f2', height: 7 }}/>

                    <TouchableOpacity
                        style={[styles.imageModalButton, { borderBottomWidth: 0 }]}
                        onPress={() => setImageModalVisible(false)}
                    >
                        <Text style={{ fontSize: width > 550 ? 17 : 15, color: '#666666' }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <Modal
                isVisible={deleteModalVisible}
                onBackButtonPress={() => setDeleteModalVisible(false)}
                onBackdropPress={() => setDeleteModalVisible(false)}
                onSwipeComplete={() => setDeleteModalVisible(false)}
                swipeDirection='down'
                animationOutTiming={300}
                backdropTransitionOutTiming={500}
                backdropOpacity={0.55}
            >
                <View style={styles.deleteModalContainer}>
                    <Text style={{ fontSize: width > 550 ? 23 : 20, fontFamily: 'roboto-medium', marginTop: 20, marginLeft: 20 }}>Delete Account</Text>

                    <TouchableOpacity
                        style={{ width: '90%', height: width > 550 ? 60 : 50, backgroundColor: '#F23F45', alignSelf: 'center', borderRadius: 10, marginTop: 25, alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => setDeleteModalVisible(false)}
                    >
                        <Text style={{ color: 'white', fontFamily: 'roboto-medium', fontSize: width > 550 ? 18 : 16 }}>Okay</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ width: '90%', height: width > 550 ? 60 : 50, alignSelf: 'center', borderRadius: 10, marginTop: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 1 }}
                        onPress={() => setDeleteModalVisible(false)}
                    >
                        <Text style={{ fontFamily: 'roboto-medium', fontSize: width > 550 ? 18 : 16 }}>Cancel</Text>
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
    imageModalContainer: {
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
    },
    closeButton: {
        height: width > 550 ? 40 : 37,
        width: width > 550 ? 40 : 37,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#d9d9d9',
        left: Platform.OS === 'android' ? 9 : 0
    },
    profilePictureContainer: {
        height: width > 550 ? 125 : 90,
        width: width > 550 ? 125 : 90,
        alignSelf: 'center',
        marginTop: 35
    },
    pictureOverlay: {
        height: '100%',
        width: '100%',
        borderRadius: 65,
        backgroundColor: 'black',
        position: 'absolute',
        opacity: 0.45
    },
    inputContainer: {
        alignSelf: 'center',
        width: width > 550 ? '70%' : '80%',
        paddingHorizontal: width > 550 ? 25 : 20,
        borderRadius: width > 550 ? 30 : 25,
        borderColor: 'black',
        borderWidth: 1,
        height: width > 550 ? 65 : 55,
        //marginTop: width > 550 ? '8%' : '10%',
        justifyContent: 'center'
    },
    label: {
        position: 'absolute',
        left: width > 550 ? '20.5%' : '18%',
        //top: width > 550 ? 38 : 28,
        backgroundColor: Colors.theme,
        fontSize: width > 550 ? 17 : 14
    },
    deleteModalContainer: {
        backgroundColor: Colors.theme,
        borderRadius: 20,
        height: width > 550 ? 260 : 220,
        width: width > 550 ? 400 : 300,
        alignSelf: 'center'
    }
});

export default EditProfileScreen;