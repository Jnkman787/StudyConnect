import React from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { width } from '../utils/Scaling';
import Colors from '../utils/Colors';

import { Ionicons } from '@expo/vector-icons';

const CalendarTaskItem = ({ task }) => {

    const TitleLayout = () => {
        return (
            <Text style={styles.nameText}>{task.item.name}</Text>
        );
    };

    const SideBar = () => {
        return (
            <View style={{ marginRight: 15 }}>
                <View style={{ flex: 1, width: 1, backgroundColor: 'black', marginLeft: width > 550 ? 22 : 19 }}/>
                <View style={styles.outerCircle}>
                    <View style={[styles.iconCircle, { backgroundColor: Colors.subTheme }]}>
                        <Ionicons name='school' size={28} color='white'/>
                    </View>
                </View>
                <View style={{ height: width > 550 ? 22 : 18, width: 1, backgroundColor: 'black', marginLeft: width > 550 ? 22 : 19 }}/>
            </View>
        );
    };

    return (
        <TouchableHighlight
            style={{ width: width > 550 ? '75%' : '90%', alignSelf: 'center' }}
            //onPress={() => }
            underlayColor={Colors.subTheme}
        >
            <View style={{ flex: 1, flexDirection: 'row' }}>
                {SideBar()}
                <View style={{ marginTop: 18, height: width > 550 ? 95 : 80, flex: 1, backgroundColor: Colors.subTheme, borderRadius: 20, justifyContent: 'center' }}>
                    {TitleLayout()}
                </View>
                <View style={[styles.colorBar, { backgroundColor: 'white' }]}/>
            </View>
        </TouchableHighlight>
    );
};

const styles = StyleSheet.create({
    nameText: {
        color: 'white',
        fontSize: width > 550 ? 21 : 18,
        fontFamily: 'roboto-medium',
        marginLeft: 25
    },
    descriptionText: {
        color: 'white',
        fontSize: width > 550 ? 17 : 15,
        marginLeft: 25
    },
    outerCircle: {
        height: width > 550 ? 51 : 46,
        width: width > 550 ? 51 : 46,
        borderRadius: width > 550 ? 26 : 23,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.theme,
        right: 3
    },
    iconCircle: {
        height: width > 550 ? 45 : 40,
        width: width > 550 ? 45 : 40,
        borderRadius: width > 550 ? 23 : 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    colorBar: {
        height: width > 550 ? 50 : 40,
        width: width > 550 ? 8 : 7,
        borderRadius: 5,
        right: width > 550 ? 25 : 20,
        top: width > 550 ? 38 : 38
    }
});

export default CalendarTaskItem;