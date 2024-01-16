import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { width } from '../../utils/Scaling';
import Colors from '../../utils/Colors';
import { collection, getCountFromServer, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase-config';

import MemberPreview from '../../components/MemberPreview';

const MemberListScreen = ({ navigation, route }) => {  // <-- pass the group name (or groupID #) and use this to identify what to display
    const { groupName } = route.params;
    const [numMembers, setNumMembers] = useState(0);
    const [memberList, setMemberList] = useState(null);
    
    useEffect(() => {
        // using the group id, retrieve the group data on members
        getMembers();
    }, []);

    async function getMembers () {
        let members = [];
        const colRef = collection(db, 'groups', groupName, 'members');
        //const count = await getCountFromServer(colRef);   // <-- count # of documents in a collection
        const docsSnap = await getDocs(colRef);
        docsSnap.forEach(doc => {
            members.push(doc.data());
        });

        // check if there are any members
        //console.log(Object.keys(members).length === 0);

        // set the number of members
        setNumMembers(members.length);      // <-- or setNumMembers(docsSnap.docs.length)
        
        // re-order members list in alphabetical order based on username
        members.sort(function (a, b) {
            if (a.username < b.username) { return -1; }
            else if (a.username > b.username) { return 1; }
            return 0;
        });

        setMemberList(members);
    };

    return (
        <View style={styles.screen}>
            {/* create a useState variable for saving the # of members in the FlatList array */}
            <Text style={styles.memberCountText}>{numMembers} members</Text>

            {/* Use FlatList for displaying an array of the members in this group*/}
            {memberList && <FlatList
                data={memberList}
                renderItem={memberData =>
                    <MemberPreview navigation={navigation} member={memberData}/>
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
    memberCountText: {
        fontSize: width > 550 ? 19 : 16,
        fontFamily: 'roboto-medium',
        marginLeft: 15,
        marginTop: 20,
        marginBottom: 10
    }
});

export default MemberListScreen;