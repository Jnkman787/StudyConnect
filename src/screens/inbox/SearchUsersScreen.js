import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { width } from "../../utils/Scaling";
import Colors from "../../utils/Colors";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../../firebase-config";

import MemberPreview from "../../components/MemberPreview";

import { MaterialIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { EvilIcons } from '@expo/vector-icons';

const SearchUsersScreen = ({ navigation }) => {
    const [activeInput, setActiveInput] = useState(false);
    const [search, setSearch] = useState(null);
    //const [unlinkedUsers, setUnlinkedUsers] = useState(null);
    const [allUsers, setAllUsers] = useState(null);
    const [listedUsers, setListedUsers] = useState(null);

    useEffect(() => {
        // get a list of members which the user hasn't yet connected with
        //getUnlinkedUsers();

        // get a list of all the app's users
        getAllUsers();
    }, []);

    useEffect(() => {
        if (search != null) {   // <-- search for users that match the search value
            if (search === '') {
                //setListedUsers(unlinkedUsers);
                setListedUsers(allUsers);
            } else {
                getSearchUsers();
            }
        //} else {    // <-- display all the members which the user hasn't yet started messaging
        //    setListedUsers(unlinkedUsers);
        } else {    // <-- display all of the members
            setListedUsers(allUsers);
        }
    }, [search, allUsers]);

    async function getAllUsers () {
        let users = [];
        const colRef = collection(db, 'profiles');
        const docsSnap = await getDocs(colRef);     // list of all members/users

        // look for the user and remove them from the list
        for (let i = 0; i < docsSnap.docs.length; i++) {
            if (docsSnap.docs[i].id != auth.currentUser.uid) {
                users.push(docsSnap.docs[i].data());
            }
        }

        if (users.length > 0) { setAllUsers(users); }
    }

    /*async function getUnlinkedUsers () {
        let users = [];
        const colRef = collection(db, 'profiles');
        const docsSnap = await getDocs(colRef);     // list of all users

        const colRef2 = collection(db, 'profiles', auth.currentUser.uid, 'direct-messages');
        const docsSnap2 = await getDocs(colRef2);   // list of users whom the user has already started messaging

        // find values not in common
        for (let i = 0; i < docsSnap.docs.length; i++) {
            let found = false;
            for (let j = 0; j < docsSnap2.docs.length; j++) {
                if (docsSnap.docs[i].id === docsSnap2.docs[j].id) {
                    found = true;
                    break;
                }
            }
            // check if the member is the currently signed on user
            if (docsSnap.docs[i].id === auth.currentUser.uid) { found = true; }
            
            if (!found) { users.push(docsSnap.docs[i].data()); }
        }

        if (users.length > 0) { setUnlinkedUsers(users); }
        else { setUnlinkedUsers(null); }
    };*/

    async function getSearchUsers () {
        let users = [];
        
        // check which users match the search term by username
        for (let i in allUsers) {
            if (allUsers[i].username.toLowerCase().includes(search.toLowerCase())) {
                users.push(allUsers[i]);
            }
        }
        if (users.length === 0) { setListedUsers(null); }
        else { setListedUsers(users); }
    };

    const SearchCount = () => {
        if (search) {
            if (listedUsers === null) {
                /*return (
                    <View style={{ width: width > 550 ? '90%' : '83%', alignSelf: 'center', marginTop: 15, marginBottom: 5 }}>
                        <Text style={{ fontSize: width > 550 ? 19 : 16, fontFamily: 'roboto-medium', color: '#404040' }}>0 results for "{search}"</Text>
                    </View>
                );*/
                return (    // <-- needs to be adjusted for both android and screen size of width > 550
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: '70%' }}>
                        <EvilIcons name='search' size={130} color='#999999'/>
                        <Text style={{ marginTop: 10, fontFamily: 'roboto-medium', fontSize: 20 }}>No results found</Text>
                        <Text style={{ marginTop: 15, fontSize: 16 }}>Try another search</Text>
                    </View>
                );
            } else {
                return (
                    <View style={{ width: width > 550 ? '90%' : '83%', alignSelf: 'center', marginTop: 15, marginBottom: 5 }}>
                        {listedUsers.length > 1
                            ? <Text style={{ fontSize: width > 550 ? 19 : 16, fontFamily: 'roboto-medium', color: '#404040' }}>{listedUsers.length} results for "{search}"</Text>
                            : <Text style={{ fontSize: width > 550 ? 19 : 16, fontFamily: 'roboto-medium', color: '#404040' }}>{listedUsers.length} result for "{search}"</Text>
                        }
                    </View>
                );
            }
        }
    };
    
    return (
        <View style={styles.screen}>
            <View style={styles.searchBarContainer}>
                <TouchableOpacity
                    style={{ marginRight: 12 }}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name='keyboard-backspace' size={30} color='black'/>
                </TouchableOpacity>
                <TextInput
                    onFocus={() => setActiveInput(true)}
                    onBlur={() => setActiveInput(false)}
                    placeholder={activeInput ? '' : 'Users...'}
                    placeholderTextColor={'#737373'}
                    value={search}
                    onChangeText={setSearch}
                    selectionColor={Colors.subTheme}
                    style={styles.searchInputContainer}
                />
                {search && <TouchableOpacity
                    style={{ height: '100%', width: 32, alignItems: 'flex-end', justifyContent: 'center' }}
                    onPress={() => {
                        setSearch(null);
                        setListedUsers(null);
                    }}
                >
                    <AntDesign name='closecircle' size={width > 550 ? 25 : 22} color={'#737373'}/>
                </TouchableOpacity>}
            </View>

            {SearchCount()}

            <View style={{ width: width > 550 ? '95%' : '97%', alignSelf: 'center', marginTop: !search ? 15 : 0 }}>
                {listedUsers && <FlatList
                    data={listedUsers}
                    renderItem={userData => 
                        <MemberPreview navigation={navigation} member={userData}/>
                    }
                />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.theme
    },
    searchBarContainer: {
        alignSelf: 'center',
        width: '90%',
        height: width > 550 ? 60 : 50,
        backgroundColor: '#ebebeb',
        marginTop: 15,
        borderRadius: width > 550 ? 30 : 25,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '4%'
    },
    searchInputContainer: {
        fontSize: width > 550 ? 19 : 17,
        flex: 1,
        height: 45
    }
});

export default SearchUsersScreen;