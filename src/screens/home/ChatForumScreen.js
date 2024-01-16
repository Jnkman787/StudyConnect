import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TextInput, TouchableOpacity, Keyboard, FlatList, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native';
import { width } from '../../utils/Scaling';
import Colors from '../../utils/Colors';
import { useHeaderHeight } from '@react-navigation/elements';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase-config';

import ChatMessage from '../../components/ChatMessage';

import { MaterialIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';

const ChatForumScreen = ({ navigation, route }) => {   // <-- pass the group name (or groupID #) and use this to identify what to display
    const { groupName, joined } = route.params;
    const scrollViewRef = useRef();
    const headerHeight = useHeaderHeight();
    const [activeInput, setActiveInput] = useState(false);
    const [showSendButton, setShowSendButton] = useState(false);
    const [addButton, setAddButton] = useState(false);
    
    const [numMembers, setNumMembers] = useState(0);
    const [message, setMessage] = useState(null);
    const [messageList, setMessageList] = useState(null);

    useEffect(() => {
        // activate a listener to get realtime updates of the messages and members in the chatroom
        setupListener();
    }, []);

    // update header whenever the number of members changes/updates
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => {
                return (
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: width > 550 ? 21 : 18, fontWeight: 'bold', color: Colors.subTheme }}>{groupName}</Text>
                        <Text style={{ fontSize: width > 550 ? 17 : 14 }}>{numMembers} members</Text>
                    </View>
                );
            }
        });
    }, [numMembers]);

    // show the send option if the message is not equal to null & contains more than just spaces
    useEffect(() => {
        if (message === null || message.length == 0) {
            setShowSendButton(false);
        } else if (message.length > 0) {
            // check if the message only consists of spaces
            if (message.replace(/\s/g, '').length == 0) {
                setShowSendButton(false);
            } else {
                setShowSendButton(true);
            }
        }
    }, [message]);

    // update listed messages & number of members
    function setupListener () {
        {/* there must be a more efficient way to retrieve new messages than to generate a new list from scratch each time */}
        onSnapshot(collection(db, 'groups', groupName, 'chatroom'), docsSnap => {
            let messages = [];
            docsSnap.forEach(doc => {
                messages.push(doc.data());
            });

            // order list of messages in chronological order
            messages.sort(function (a, b) {
                return a.createdAt.seconds - b.createdAt.seconds;
            });

            setMessageList(messages);
        });

        onSnapshot(collection(db, 'groups', groupName, 'members'), docsSnap => {
            setNumMembers(docsSnap.docs.length);
        });
    };

    function addMessage () {
        let newDate = new Date();

        const docData = {
            createdAt: newDate,
            email: auth.currentUser.email,
            userID: auth.currentUser.uid,
            username: auth.currentUser.displayName,
            message: message
        };

        addDoc(collection(db, 'groups', groupName, 'chatroom'), docData)
        .then(docRef => {})
        .catch(error => console.log(error))

        setMessage(null);
    };

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + 44 : 0}
        >
            <TouchableWithoutFeedback 
                onPress={() => {
                    Keyboard.dismiss();
                    setAddButton(false);
                }
            }>
                <View style={{ flex: 1 }}>
                    {messageList != null ? <FlatList
                        //ref={scrollViewRef} // <-- ?
                        data={messageList}
                        /*onContentSizeChange={() => {
                            scrollViewRef.current.scrollToIndex({animated: true, index: (messageList.length - 1)});
                        }}
                        //extraData={messageList}*/
                        renderItem={messageData =>
                            <ChatMessage
                                navigation={navigation}
                                message={messageData}
                            />
                        }
                    /> : <View/>}
                </View>
            </TouchableWithoutFeedback>

            {joined && <View style={styles.messageContainer}>
                <TouchableOpacity
                    style={styles.addButton}
                    // decide later whether or not to create a pop-up modal with different upload options like in the LinkedIn app
                    onPress={() => {
                        if (addButton) { setAddButton(false); }
                        else { 
                            setAddButton(true);
                            Keyboard.dismiss();
                        }
                    }}
                >
                    {addButton
                        ? <AntDesign name='close' size={width > 550 ? 31 : 25} color={Colors.subTheme}/>
                        : <Feather name='plus' size={width > 550 ? 35 : 30} color={Colors.subTheme}/>
                    }
                </TouchableOpacity>
                <TextInput
                    onFocus={() => {
                        setActiveInput(true);
                        setAddButton(false);
                    }}
                    onBlur={() => setActiveInput(false)}
                    placeholder={activeInput ? '' : 'Write a message...'}
                    placeholderTextColor={'#737373'}
                    value={message}
                    onChangeText={setMessage}
                    //selectionColor={Platform.OS === 'ios' ? '#0066ff' : '#99ccff'}
                    selectionColor={Colors.subTheme}
                    //multiline={true}
                    //onContentSizeChange={}
                    //maxLength={}
                    style={styles.messageInputContainer}
                />
                {showSendButton ? <TouchableOpacity
                    style={{ marginLeft: width > 550 ? 16 : 12 }}
                    onPress={() => {
                        Keyboard.dismiss();
                        addMessage();
                    }}
                >
                    <MaterialIcons name='send' size={width > 550 ? 40 : 30} color={Colors.subTheme}/>
                </TouchableOpacity>
                    : <MaterialIcons name='send' size={width > 550 ? 40 : 30} color={'#d9d9d9'} style={{ marginLeft: width > 550 ? 16 : 12 }}/>}
            </View>}

            {joined && addButton && <View style={styles.messageContainer}>
                <View style={{ flexDirection: 'row', marginTop: 5, justifyContent: 'space-evenly', flex: 1 }}>
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity
                            style={styles.optionContainer}
                            //onPress={() =>}
                        >
                            <MaterialIcons name='emoji-emotions' size={width > 550 ? 35 : 30} color={Colors.subTheme}/>
                        </TouchableOpacity>
                        <Text style={{ marginTop: 5, color: '#4d4d4d', fontSize: width > 550 ? 18 : 16 }}>Emojis</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity
                            style={styles.optionContainer}
                            //onPress={() =>}   // <-- add function for uploading an image and displaying it in the chatroom
                        >
                            <Foundation name='paperclip' size={width > 550 ? 35 : 30} color={Colors.subTheme}/>
                        </TouchableOpacity>
                        <Text style={{ marginTop: 5, color: '#4d4d4d', fontSize: width > 550 ? 18 : 16 }}>Upload</Text>
                    </View>
                </View>
            </View>}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.theme
    },
    messageContainer: {
        borderTopWidth: 0.5,
        borderColor: Colors.border,
        paddingTop: 12,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.theme
    },
    addButton: {
        height: width > 550 ? 45 : 35,
        width: width > 550 ? 45 : 35,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ebebeb',
        marginHorizontal: width > 550 ? 10 : 7
    },
    messageInputContainer: {
        height: width > 550 ? 60 : 50,  // <-- find a way to expand height
        width: width > 550 ? '78%' : '72%',
        backgroundColor: '#ebebeb',
        borderRadius: width > 550 ? 30 : 25,
        paddingHorizontal: width > 550 ? 25 : 20,
        fontSize: width > 550 ? 20 : 17,
        color: 'black',
        //paddingTop: Platform.OS === 'ios' ? 15 : 0    <-- use if the textInput is multiline
    },
    optionContainer: {
        height: width > 550 ? 60 : 50,
        width: width > 550 ? 60 : 50,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#4d4d4d',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default ChatForumScreen;