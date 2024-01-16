import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { width } from '../utils/Scaling';
import Colors from '../utils/Colors';
import { ref, getStorage, getDownloadURL } from 'firebase/storage';
import { auth } from '../../firebase-config';

import MemberDetails from './MemberDetails';

const ChatMessage = ({ navigation, message }) => {  // <-- pass all the arguments needed to fill in the details of the message
    const [profileImage, setProfileImage] = useState(null);
    const [timeDate, setTimeDate] = useState('');
    const [displayedUsername, setDisplayedUsername] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    function checkUsernameLength () {
        if (width > 550) {
            setDisplayedUsername(message.item.username);
        } else {
            if (message.item.username.length > 17) {
                let tempUsername = message.item.username;
                setDisplayedUsername(tempUsername.slice(0, 15) + '...');
            } else {
                setDisplayedUsername(message.item.username);
            }
        }
    };
    
    function getTimeText () {
        let today = new Date();
        let messageDate = message.item.createdAt.toDate();

        let hours = messageDate.getHours();
        let minutes = messageDate.getMinutes();
        let timePeriod;

        // set hours & timePeriod
        if (messageDate.getHours() >= 12) {     // PM
            timePeriod = 'PM';
            if (messageDate.getHours() > 12) { hours = messageDate.getHours() - 12; }
        } else {    // AM
            timePeriod = 'AM';
            if (messageDate.getHours() == 0) { hours = 12; }
        }

        // set minutes
        if (messageDate.getMinutes() < 10) { minutes = '0' + messageDate.getMinutes(); }

        // check if the recorded date at which the message was sent was today
        if (messageDate.getFullYear() == today.getFullYear()) {
            if (messageDate.getMonth() == today.getMonth()) {
                if (messageDate.getDate() == today.getDate()) {     // message was sent today
                    setTimeDate(hours + ':' + minutes + ' ' + timePeriod);
                } else {    // message was sent this month, but not today
                    setTimeDate(messageDate.toString().slice(4, 10) + ', ' + hours + ':' + minutes + ' ' + timePeriod);
                }
            } else {    // message was sent this year
                setTimeDate(messageDate.toString().slice(4, 10) + ', ' + hours + ':' + minutes + ' ' + timePeriod);
            }
        } else {
            setTimeDate((messageDate.getMonth() + 1) + '/' + messageDate.getDate() + '/' + messageDate.getFullYear() + ', ' + hours + ':' + minutes + ' ' + timePeriod);
        }
    };

    useEffect(() => {
        // will likely need to check if the object is empty
        if (Object.keys(message.item).length != 0) {
            checkUsernameLength();
            getTimeText();

            // set the user's profile image
            let location = 'profileImages/' + message.item.userID;
            getDownloadURL(ref(getStorage(), location))
            .then((url) => {
                setProfileImage(url);
            }).catch(error => {})
        }
    }, []);

    const MessageLayout = () => {
        if (message.item.userID === auth.currentUser.uid) {
            return (
                <View style={[styles.messageContainer, { alignSelf: 'flex-end', marginRight: 15, justifyContent: 'flex-end' }]}>
                    <View style={{ marginRight: 10, alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: width > 550 ? 15 : 13, color: '#808080' }}>{timeDate}</Text>
                        <View style={[styles.textBubble, { backgroundColor: Colors.subTheme }]}>
                            <Text style={{ fontSize: width > 550 ? 18 : 16, color: 'white' }}>{message.item.message}</Text>
                        </View>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={[styles.messageContainer, { marginLeft: 15 }]}>
                    <TouchableOpacity
                        style={styles.imageContainer}
                        onPress={() => setModalVisible(true)}
                    >
                        <Image
                            source={profileImage ? { uri: profileImage } : require('../assets/images/profile-outline.png')}
                            style={{ flex: 1, height: undefined, width: undefined, borderRadius: 30 }}
                        />
                    </TouchableOpacity>

                    <View style={styles.textContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.usernameText}>{displayedUsername}</Text>
                            <Text style={{ fontSize: width > 550 ? 15 : 13, color: '#808080' }}>  •  {timeDate}</Text>
                        </View>
                        <View style={[styles.textBubble, { backgroundColor: '#666666' }]}>
                            <Text style={{ fontSize: width > 550 ? 18 : 16, color: 'white' }}>{message.item.message}</Text>
                        </View>
                    </View>
                </View>
            );
        }
    };
    
    return (
        <View>
            {MessageLayout()}

            <MemberDetails navigation={navigation} modalVisible={modalVisible} setModalVisible={setModalVisible} member={message.item} profileImage={profileImage}/>
        </View>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        width: '80%',
        flexDirection: 'row',
        marginTop: 10
    },
    imageContainer: {
        height: width > 550 ? 55 : 35,
        width: width > 550 ? 55 : 35,
        borderRadius: width > 550 ? 30 : 20,
        //top: width > 550 ? 25 : 15,
        //alignSelf: 'center'
        marginTop: width > 550 ? 15 : 15
    },
    textContainer: {
        marginLeft: 10,
        alignItems: 'flex-start'
    },
    usernameText: {
        fontSize: width > 550 ? 21 : 18,
        fontFamily: 'roboto-medium'
    },
    textBubble: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: width > 550 ? 20 : 15,
        marginTop: width > 550 ? 10 : 7
    }
});

export default ChatMessage;