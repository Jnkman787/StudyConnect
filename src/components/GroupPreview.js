import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { width } from '../utils/Scaling';
import Colors from '../utils/Colors';
import { ref, getStorage, getDownloadURL } from 'firebase/storage';

// temp function for capstone video demo
const getNumMembers = (group) => {
    if (group.item.id === 'ECE 4415') { return 5; }
    else if (group.item.id === 'African Association') { return 23; }
    else if (group.item.id === 'Basketball') { return 73; }
    else if (group.item.id === 'Chess Club') { return 36; }
    else if (group.item.id === 'DIGIHUM 2127') { return 29; }
    else if (group.item.id === 'French Club') { return 44; }
    else if (group.item.id === 'PSYCHOL 2061') { return 60; }
    else if (group.item.id === 'Romanian Association') { return 15; }
    else if (group.item.id === 'SE 3313') { return 41; }
    else if (group.item.id === 'Science Council') { return 31; }
    else if (group.item.id === 'Soccer') { return 57; }
    else if (group.item.id === 'Spectrum UWO') { return 13; }
};

const GroupPreview = ({ navigation, group }) => {  // <-- pass the group name (or groupID #) and use this to identify what to display
    const [groupImage, setGroupImage] = useState(null);
    const [numMembers, setNumMembers] = useState(0);
    
    useEffect(() => {
        let location = 'groupImages/' + group.item.id;
        getDownloadURL(ref(getStorage(), location))
        .then((url) => {
            setGroupImage(url);
        }).catch(error => {
            // group doesn't have a saved profile image
            // therefore, keep the groupImage value as null
        })

        //console.log(group.item.data());
        setNumMembers(getNumMembers(group));
    }, [group]);

    return (
        <View style={styles.groupContainer}>
            <TouchableOpacity
                onPress={() => navigation.navigate('HomeStack', { screen: 'Group', params: { groupName: group.item.id } })}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={groupImage ? { uri: groupImage } : require('../assets/images/defaultGroupImage.png')}
                        style={{ flex: 1, height: undefined, width: undefined, borderRadius: groupImage ? 10 : 0 }}
                    />
                </View>
                <View>
                    {/* adjust group name with ... at the end if it's too long to fit on the screen */}
                    <Text style={styles.groupNameText}>{group.item.id}</Text>
                    <Text style={{ fontSize: width > 550 ? 18 : 16 }}>{numMembers} members</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    groupContainer: {
        width: '100%',
        height: 100,
        borderColor: Colors.border,
        borderBottomWidth: 1
    },
    imageContainer: {
        height: 75,
        width: 100,
        marginLeft: 30,
        marginRight: 20
    },
    groupNameText: {
        fontSize: width > 550 ? 21 : 18,
        fontFamily: 'roboto-medium'
    }
});

export default GroupPreview;