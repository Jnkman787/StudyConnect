import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { width } from '../../utils/Scaling';
import Colors from '../../utils/Colors';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase-config';

import GroupPreview from '../../components/GroupPreview';

import { Entypo } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { EvilIcons } from '@expo/vector-icons';

const getCategoryIcon = (category, iconColor) => {
    let icon;

    if (category === 'Courses') {
        icon = <Ionicons name='school' size={width > 550 ? 40 : 33} color={iconColor}/>
    } else if (category === 'Sports') {
        icon = <Ionicons name='basketball' size={width > 550 ? 44 : 36} color={iconColor} style={{ right: width > 550 ? 1.5 : 1 }}/>
    } else if (category === 'Academic') {
        icon = <FontAwesome5 name='chess-knight' size={width > 550 ? 40 : 32} color={iconColor} style={{ left: 5.5 }}/>
    } else if (category === 'Media') {
        icon = <Entypo name='camera' size={width > 550 ? 38 : 31} color={iconColor} style={{ left: width > 550 ? 1.5 : 2 }}/>
    } else if (category === 'Cultural') {
        icon = <Entypo name='globe' size={width > 550 ? 39 : 33} color={iconColor} style={{ left: 1.5 }}/>
    } else if (category === 'Political') {
        icon = <FontAwesome5 name='balance-scale' size={width > 550 ? 33 : 27} color={iconColor}/>
    } else if (category === 'Society') {
        icon = <FontAwesome name='group' size={width > 550 ? 36 : 30} color={iconColor} style={{ left: 1 }}/>
    } else if (category === 'Gaming') {
        icon = <Ionicons name='game-controller' size={width > 550 ? 42 : 35} color={iconColor}/>
    }

    return icon;
};

const SearchScreen = ({ navigation }) => {
    // Recent searches
    // -> track the most recent 4 searches performed by a user and display them
    // Top categories
    // -> re-list the category options to select and list

    const [activeInput, setActiveInput] = useState(false);
    const [search, setSearch] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [listedGroups, setListedGroups] = useState(null);

    useEffect(() => {
        if (selectedCategory != null) {
            getCategoryGroups();
            setSearch(selectedCategory);
        }
    }, [selectedCategory]);

    useEffect(() => {
        if (selectedCategory === null) {
            if (search != null) {
                if (search === '') {    // <-- search value is empty
                    setListedGroups(null);
                } else {
                    getSearchGroups();
                }
            }
        } else {    // (selectedCategory != null) <-- there is a category selected
            if (search != selectedCategory) {   // <-- search (textInput) has been modified after selecting a category
                setSelectedCategory(null);
                getSearchGroups();
            }
        }
    }, [search]);

    async function getCategoryGroups () {
        let groups = [];
        const docsSnap = await getDocs(collection(db, 'groups'));
        
        // check if the groups match the selected category
        for (let i in docsSnap.docs) {
            if (docsSnap.docs[i].data().category === selectedCategory) {
                groups.push(docsSnap.docs[i]);
            }
        }
        setListedGroups(groups);
    };

    async function getSearchGroups () {
        let groups = [];
        const docsSnap = await getDocs(collection(db, 'groups'));

        // check which groups match the search term by name
        // this includes those containing the entered string (regardless of upper or lowercase letters)
        for (let i in docsSnap.docs) {
            if (docsSnap.docs[i].id.toLowerCase().includes(search.toLowerCase())) {
                groups.push(docsSnap.docs[i]);
            }
        }
        if (groups.length === 0) {
            setListedGroups(null);
        } else {
            setListedGroups(groups);
        }
    };

    const CategoryTouchable = (category, last) => {
        return (
            <View>
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', height: width > 550 ? 75 : 60 }}
                    onPress={() => setSelectedCategory(category)}
                >
                    <View style={{ width: width > 550 ? 45 : 40 }}>
                        {getCategoryIcon(category, Colors.subTheme)}
                    </View>
                    <Text style={{ fontSize: width > 550 ? 18 : 16, marginLeft: 20 }}>{category}</Text>
                </TouchableOpacity>
                {!last && <View style={styles.categoryBorder}/>}
            </View>
        );
    };

    const CategoryList = () => {
        return (
            <View>
                <Text style={styles.headerText}>Categories</Text>
                {CategoryTouchable('Courses')}
                {CategoryTouchable('Sports')}
                {CategoryTouchable('Academic')}
                {CategoryTouchable('Media')}
                {CategoryTouchable('Cultural')}
                {CategoryTouchable('Political')}
                {CategoryTouchable('Society')}
                {CategoryTouchable('Gaming', true)}
            </View>
        );
    };

    const SearchCount = () => {
        if (search) {
            if (listedGroups === null) {
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
                        <Text style={{ fontSize: width > 550 ? 19 : 16, fontFamily: 'roboto-medium', color: '#404040' }}>{listedGroups.length} results for "{search}"</Text>
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
                    placeholder={activeInput ? '' : 'Courses, teams, clubs, etc'}
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
                        setSelectedCategory(null);
                        setListedGroups(null);
                    }}
                >
                    <AntDesign name='closecircle' size={width > 550 ? 25 : 22} color={'#737373'}/>
                </TouchableOpacity>}
            </View>

            {SearchCount()}

            {!search && <View style={{ width: '90%', alignSelf: 'center' }}>{CategoryList()}</View>}

            {listedGroups && <FlatList
                data={listedGroups}
                renderItem={groupData =>
                    <GroupPreview navigation={navigation} group={groupData}/>
                }
            />}
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
    headerText: {
        fontSize: width > 550 ? 21 : 18,
        fontFamily: 'roboto-medium',
        marginTop: 25,
        marginBottom: width > 550 ? 20 : 15
    },
    categoryBorder: {
        borderColor: Colors.border,
        borderBottomWidth: 1,
        //marginVertical: width > 550 ? 15 : 10
    },
    searchInputContainer: {
        fontSize: width > 550 ? 19 : 17,
        flex: 1,
        height: 45
    }
});

export default SearchScreen;