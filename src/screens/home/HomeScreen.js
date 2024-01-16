import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, ScrollView, Platform, FlatList } from 'react-native';
import { width, verticalScale } from '../../utils/Scaling';
import Colors from '../../utils/Colors';
import Modal from 'react-native-modal';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../firebase-config';

import GroupPreview from '../../components/GroupPreview';

import CustomIcon from '../../utils/CustomIcon';
import { Entypo } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

const getCategoryIcon = (category, iconColor) => {
    let icon;

    if (category === 'Courses') {
        icon = <Ionicons name='school' size={width > 550 ? 53 : 43} color={iconColor}/>
    } else if (category === 'Sports') {
        icon = <Ionicons name='basketball' size={width > 550 ? 55 : 45} color={iconColor}/>
    } else if (category === 'Academic') {
        icon = <FontAwesome5 name='chess-knight' size={width > 550 ? 50 : 40} color={iconColor}/>
    } else if (category === 'Media') {
        icon = <Entypo name='camera' size={width > 550 ? 50 : 40} color={iconColor}/>
    } else if (category === 'Cultural') {
        icon = <Entypo name='globe' size={width > 550 ? 49 : 38} color={iconColor}/>
    } else if (category === 'Political') {
        icon = <FontAwesome5 name='balance-scale' size={width > 550 ? 43 : 35} color={iconColor}/>
    } else if (category === 'Society') {
        icon = <FontAwesome name='group' size={width > 550 ? 46 : 37} color={iconColor}/>
    } else if (category === 'Gaming') {
        icon = <Ionicons name='game-controller' size={width > 550 ? 55 : 45} color={iconColor}/>
    }

    return icon;
};

const HomeScreen = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [displayCategories, setDisplayCategories] = useState(['Courses', 'Sports', 'Academic', 'Media']);
    const [groups, setGroups] = useState(null);
    const [userGroups, setUserGroups] = useState(null);
    const [suggestedGroups, setSuggestedGroups] = useState(null);

    // prevent the user from leaving the screen (stopping accidental self-logout)
    /*useEffect(() => {
        navigation.addListener('beforeRemove', (e) => {
            e.preventDefault();
        });
    }, [navigation]);*/

    useEffect(() => {
        checkProfileList();
        //setupListener();
    }, []);

    /* temp for video demo (check if the user is listed under the profiles collection) */
    async function checkProfileList () {
        const docsSnap = await getDocs(collection(db, 'profiles'));

        for (let i in docsSnap.docs) {
            const doc = docsSnap.docs[i].data();
            if (doc.userID == auth.currentUser.uid) {
                // activate a listener to get realtime updates about groups
                setupListener();
                return;
            }
        }

        // else: simply list all the groups, regardless of category or if user has joined
        onSnapshot(collection(db, 'groups'), docsSnap => {
            let groupList = [];
            docsSnap.forEach(doc => {
                groupList.push(doc);
            });
            setUserGroups(groupList);
        });
    };

    // update categories displayed as selected
    useEffect(() => {
        if (selectedCategory != null) {
            let newDisplayArray = ['Courses', 'Sports', 'Academic', 'Media'];

            // check if the selected category is included in the current list of display categories
            for (let i = 0; i < newDisplayArray.length; i++) {
                if (newDisplayArray[i] == selectedCategory) {
                    newDisplayArray.splice(i, 1);
                }
            }

            newDisplayArray.unshift(selectedCategory);
            setDisplayCategories([newDisplayArray[0], newDisplayArray[1], newDisplayArray[2], newDisplayArray[3]]);
        } else {
            // reset display categories to default
            setDisplayCategories(['Courses', 'Sports', 'Academic', 'Media']);
        }
    }, [selectedCategory]);

    // update user & suggested groups based on selected category
    useEffect(() => {
        if (groups != null) {
            let filteredGroups = [];

            if (selectedCategory) {
                // check if the group matches the selected category
                for (let i = 0; i < groups.length; i++) {
                    if (groups[i].data().category == selectedCategory) {
                        filteredGroups.push(groups[i]);
                    }
                }
            } else { filteredGroups = groups; }

            // check which groups a user has joined
            checkUserGroups(filteredGroups);
        }
    }, [groups, selectedCategory]);

    // retrieve all the groups
    function setupListener () {
        onSnapshot(collection(db, 'groups'), docsSnap => {
            let groupList = [];
            docsSnap.forEach(doc => {
                groupList.push(doc);
            });
            setGroups(groupList);
        });
    };

    async function checkUserGroups (groupList) {    // <-- try and find a better way to do this
        let myGroups = [];
        let suggestions = [];

        // get the user's list of joined groups
        const docsSnap = await getDocs(collection(db, 'profiles', auth.currentUser.uid, 'groups'));

        // find values in common
        for (let i = 0; i < groupList.length; i++) {
            let found = false;
            for (let j = 0; j < docsSnap.docs.length; j++) {
                if (groupList[i].id === docsSnap.docs[j].id) {
                    myGroups.push(groupList[i]);
                    found = true;
                    break;
                }
            }
            if (!found) { suggestions.push(groupList[i]); }
        }

        if (myGroups.length === 0) { setUserGroups(null); } 
        else { setUserGroups(myGroups); }

        if (suggestions.length === 0) { setSuggestedGroups(null); }
        else { setSuggestedGroups(suggestions); }
    }

    const CategoryTouchable = (category) => {
        let color = '#ebebeb';
        let iconColor = Colors.subTheme;
        if (category === selectedCategory) {
            color = Colors.subTheme;
            iconColor = '#ebebeb';
        }

        return (
            <TouchableOpacity
                style={[styles.categoryContainer, { backgroundColor: color }]}
                onPress={() => {
                    if (category === selectedCategory) {
                        setSelectedCategory(null);
                    } else {
                        setSelectedCategory(category);
                    }
                    setModalVisible(false);
                }}
            >
                {getCategoryIcon(category, iconColor)}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.screen}>
            <TouchableWithoutFeedback
                onPress={() => navigation.navigate('HomeStack', { screen: 'Search' })}
            >
                <View style={styles.searchBarContainer}>
                    <Ionicons name='search' size={30} style={{ marginLeft: 15, marginRight: 12 }}/>
                    <Text style={{ fontSize: width > 550 ? 19 : 16, color: '#737373' }}>Courses, teams, clubs, etc</Text>
                </View>
            </TouchableWithoutFeedback>

            {/* 
                Start by listing groups the user has already joined then list suggestions
                List specific groups when a group category is selected (including groups joined in that category)

                Since I'll need to generate these lists of groups (into arrays), replace the scroll view with a flat list
            */}
            <ScrollView style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 5 }}>
                    <View style={{ alignItems: 'center' }}>
                        {CategoryTouchable(displayCategories[0])}
                        <Text style={{ top: 5, fontSize: width > 550 ? 16 : 14 }}>{displayCategories[0]}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        {CategoryTouchable(displayCategories[1])}
                        <Text style={{ top: 5, fontSize: width > 550 ? 16 : 14 }}>{displayCategories[1]}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        {CategoryTouchable(displayCategories[2])}
                        <Text style={{ top: 5, fontSize: width > 550 ? 16 : 14 }}>{displayCategories[2]}</Text>
                    </View>
                    {width > 550 ? <View style={{ alignItems: 'center' }}>
                        {CategoryTouchable(displayCategories[3])}
                        <Text style={{ top: 5, fontSize: width > 550 ? 16 : 14 }}>{displayCategories[3]}</Text>
                    </View> : null}
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity   // see all
                            style={styles.categoryContainer}
                            onPress={() => setModalVisible(true)}
                        >
                            <Feather name='more-horizontal' size={width > 550 ? 50 : 40} color={Colors.subTheme}/>
                        </TouchableOpacity>
                        <Text style={{ top: 5, fontSize: width > 550 ? 16 : 14 }}>See all</Text>
                    </View>
                </View>

                {userGroups && <FlatList
                    data={userGroups}
                    scrollEnabled={false}
                    ListHeaderComponent={
                        <View>
                            <Text style={styles.sectionText}>My Groups</Text>
                            <View style={{ borderColor: Colors.border, borderBottomWidth: 1 }}/>
                        </View>
                    }
                    renderItem={groupData =>
                        <GroupPreview navigation={navigation} group={groupData}/>
                    }
                />}

                {suggestedGroups && <FlatList
                    data={suggestedGroups}
                    scrollEnabled={false}
                    ListHeaderComponent={
                        <View>
                            <Text style={styles.sectionText}>Suggestions</Text>
                            <View style={{ borderColor: Colors.border, borderBottomWidth: 1 }}/>
                        </View>
                    }
                    renderItem={groupData =>
                        <GroupPreview navigation={navigation} group={groupData}/>
                    }
                />}
            </ScrollView>

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
                    <Text style={styles.headerText}>All categories</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 20 }}>
                        <View style={{ alignItems: 'center' }}>
                            {CategoryTouchable('Courses')}
                            <Text style={{ top: 5, fontSize: width > 550 ? 16 : 14 }}>Courses</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            {CategoryTouchable('Sports')}
                            <Text style={{ top: 5, fontSize: width > 550 ? 16 : 14 }}>Sports</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            {CategoryTouchable('Academic')}
                            <Text style={{ top: 5, fontSize: width > 550 ? 16 : 14 }}>Academic</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            {CategoryTouchable('Media')}
                            <Text style={{ top: 5, fontSize: width > 550 ? 16 : 14 }}>Media</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 25 }}>
                        <View style={{ alignItems: 'center' }}>
                            {CategoryTouchable('Cultural')}
                            <Text style={{ top: 5, fontSize: width > 550 ? 16 : 14 }}>Cultural</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            {CategoryTouchable('Political')}
                            <Text style={{ top: 5, fontSize: width > 550 ? 16 : 14 }}>Political</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            {CategoryTouchable('Society')}
                            <Text style={{ top: 5, fontSize: width > 550 ? 16 : 14 }}>Society</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            {CategoryTouchable('Gaming')}
                            <Text style={{ top: 5, fontSize: width > 550 ? 16 : 14 }}>Gaming</Text>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

HomeScreen.navigationOptions = () => {
    return {
        title: null,
        headerShadowVisible: false,
        headerLeft: () => (
            <Ionicons name='globe-outline' size={32} style={{ left: 25, top: 3 }}/>
        ),
        headerRight: () => (
            <Text style={styles.headerStyle}>StudyConnect</Text>
        ),
        tabBarIcon: ({ focused }) => {
            if (focused) {
                return (<Entypo name='home' size={30} color='black' style={{ left: 3 }}/>);
            } else {
                return (<CustomIcon name='home-outline' size={26} color='black' style={{ left: 3 }}/>);
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
        right: 25
    },
    searchBarContainer: {
        alignSelf: 'center',
        width: '90%',
        height: width > 550 ? 60 : 50,
        backgroundColor: '#ebebeb',
        marginTop: 15,
        marginBottom: 10,
        borderRadius: width > 550 ? 30 : 25,
        flexDirection: 'row',
        alignItems: 'center'
    },
    categoryContainer: {
        height: width > 550 ? 85 : 70,
        width: width > 550 ? 85 : 70,
        borderRadius: 10,
        backgroundColor: '#ebebeb',
        justifyContent: 'center',
        alignItems: 'center'
    },
    sectionText: {
        left: 18,
        fontSize: width > 550 ? 21 : 18,
        fontFamily: 'roboto-medium',
        marginTop: 25,
        marginBottom: 15
    },
    modalContainer: {
        backgroundColor: Colors.theme,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' 
            ? width > 550 ? verticalScale(40) : 50
            : width > 550 ? verticalScale(30) : 35
    },
    headerText: {
        fontSize: width > 550 ? 23 : 20,
        fontFamily: 'roboto-medium',
        alignSelf: 'center',
        marginTop: 20
    }
});

export default HomeScreen;