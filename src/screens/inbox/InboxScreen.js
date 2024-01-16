import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { width } from '../../utils/Scaling';
import Colors from '../../utils/Colors';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../../firebase-config';

import MessagePreview from '../../components/MessagePreview';
import MemberPreview from '../../components/MemberPreview';

import CustomIcon from '../../utils/CustomIcon';
import { Ionicons } from '@expo/vector-icons';

const InboxScreen = ({ navigation }) => {
    const [listType, setListType] = useState('Messages');

    // list direct messages in chronological order (newest first)
    // list friends in alphabetical order
    const [directMessages, setDirectMessages] = useState(null);
    const [friends, setFriends] = useState(null);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => {
                return (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('InboxStack', { screen: 'Search' })}
                        style={{ right: 25 }}
                    >
                        <Ionicons name='search' size={30} color='black'/>
                    </TouchableOpacity>
                );
            }
        });

        // retrieve the user's list of direct messages and friends
        getDirectMessages();
        getFriends();
    }, []);

    // get most recent creation time/date of a direct message list
    async function getRecentMessage (documentID) {
        let messages = [];
        const colRef = collection(db, 'profiles', auth.currentUser.uid, 'direct-messages', documentID, 'messages');
        const docsSnap = await getDocs(colRef);
        docsSnap.forEach(doc => {
            messages.push(doc.data());
        });

        // re-order direct messages in reverse chronological order
        messages.sort(function (a, b) {
            return a.createdAt.seconds - b.createdAt.seconds;
        });
        messages.reverse();

        return messages[0].createdAt;
    };

    async function getDirectMessages () {
        let directMessageList = [];
        const colRef = collection(db, 'profiles', auth.currentUser.uid, 'direct-messages');
        const docsSnap = await getDocs(colRef);
        docsSnap.forEach(async (doc) => {
            // create an object consisting of the doc.id & most recent message creation time/date
            let messageDate = await getRecentMessage(doc.id);
            const objectData = {
                createdAt: messageDate,
                documentID: doc.id
            };
            directMessageList.push(objectData);

            // check if the list has obtained all of the direct message documents
            if (directMessageList.length === docsSnap.docs.length) {
                // re-order direct messages list in reverse chronological order
                directMessageList.sort(function (a, b) {
                    return a.createdAt.seconds - b.createdAt.seconds;
                });
                directMessageList.reverse();
                
                setDirectMessages(directMessageList);
            }
        });
    };

    function getFriends () {
        onSnapshot(collection(db, 'profiles', auth.currentUser.uid, 'friends'), docsSnap => {
            let friendList = [];
            docsSnap.forEach(doc => {
                friendList.push(doc.data());
            });

            // re-order friend list in alphabetical order based on username
            friendList.sort(function (a, b) {
                if (a.username.toLowerCase() < b.username.toLowerCase()) { return -1; }
                else if (a.username.toLowerCase() > b.username.toLowerCase()) { return 1; }
                return 0;
            });

            setFriends(friendList);
        });
    };

    const DisplayList = () => {
        if (listType === 'Messages') {
            return (
                <View style={{ flex: 1 }}>
                    {directMessages && <FlatList
                        data={directMessages}
                        renderItem={messageData =>
                            <MessagePreview navigation={navigation} message={messageData}/>
                        }
                    />}
                </View>
            );
        } else if (listType === 'Friends') {
            return (
                <View style={{ marginTop: 5 }}>
                    {friends && <FlatList
                        data={friends}
                        renderItem={friendData =>
                            <MemberPreview navigation={navigation} member={friendData}/>
                        }
                    />}
                </View>
            );
        }
    };

    return (
        <View style={styles.screen}>
            <View style={{ flexDirection: 'row', height: 50, width: '100%' }}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: Colors.theme,
                        borderBottomColor: listType === 'Messages' ? Colors.subTheme : Colors.border,
                        borderBottomWidth: listType === 'Messages' ? 2 : 1,
                        justifyContent: 'center'
                    }}
                    onPress={() => setListType('Messages')}
                >
                    <Text style={[styles.tabText, { color: listType === 'Messages' ? 'black' : Colors.grey }]}>MESSAGES</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: Colors.theme,
                        borderBottomColor: listType === 'Friends' ? Colors.subTheme : Colors.border,
                        borderBottomWidth: listType === 'Friends' ? 2 : 1,
                        justifyContent: 'center'
                    }}
                    onPress={() => setListType('Friends')}
                >
                    <Text style={[styles.tabText, { color: listType === 'Friends' ? 'black' : Colors.grey }]}>FRIENDS</Text>
                </TouchableOpacity>
            </View>

            {DisplayList()}
        </View>
    );
};

InboxScreen.navigationOptions = () => {
    return {
        title: null,
        headerShadowVisible: false,
        headerLeft: () => (
            <Text style={styles.headerStyle}>Inbox</Text>
        ),
        headerRight: null,
        tabBarIcon: ({ focused }) => {
            if (focused) {
                return (<CustomIcon name='chat' size={27} color='black' style={{ top: 1 }}/>);
            } else {
                return (<CustomIcon name='chat-outline' size={27} color='black' style={{ top: 1 }}/>);
            }
        }
    };
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.theme
    },
    headerStyle: {
        fontSize: 22,
        fontFamily: 'roboto-medium',
        top: 2,
        left: 25
    },
    tabText: {
        fontSize: width > 550 ? 20 : 17,
        alignSelf: 'center',
        fontWeight: 'bold'
    }
});

export default InboxScreen;