import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { width } from '../utils/Scaling';
import Colors from '../utils/Colors';
import DatePicker from 'react-native-modern-datepicker';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase-config';

import CalendarTaskItem from '../components/CalendarTaskItem';

import CustomIcon from '../utils/CustomIcon';
import { Ionicons } from '@expo/vector-icons';

function setupDateForPicker (date) {
    let pickerDate;

    if (date.getMonth() < 9) {
        if (date.getDate() < 10) {
            pickerDate = date.getFullYear() + '/0' + (date.getMonth() + 1) + '/0' + date.getDate();
        } else {
            pickerDate = date.getFullYear() + '/0' + (date.getMonth() + 1) + '/' + date.getDate();
        }
    } else if (date.getDate() < 10) {
        pickerDate = date.getFullYear() + '/' + (date.getMonth() + 1) + '/0' + date.getDate();
    } else {
        pickerDate = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
    }

    return pickerDate;
};

const CalendarScreen = ({ navigation }) => {
    const [allTasks, setAllTasks] = useState(null);
    const [selectedDate, setSelectedDate] = useState(setupDateForPicker(new Date()));
    const [listedItems, setListedItems] = useState(null);

    useEffect(() => {
        // get the entire list of tasks from which I can check which to display based on the selected date
        // ideally this would be done using a snapshot listener so as to update when new tasks are created by the user
        getAllTasks();
    }, []);

    function checkDate (deadline) {
        // setup selected date
        let selectedYear = selectedDate.slice(0, 4);
        let selectedMonth = selectedDate.slice(5, 7);
        let selectedDay = selectedDate.slice(8, 10);

        // check if first digit is a zero
        if (selectedMonth[0] == 0) {
            selectedMonth = selectedMonth[1];
        }
        if (selectedDay[0] == 0) {
            selectedDay = selectedDay[1];
        }

        // setup deadline
        let taskDeadline = deadline.toDate();
    
        // check if deadline matches selected date
        if (taskDeadline.getFullYear() == selectedYear) {
            if ((taskDeadline.getMonth() + 1) == selectedMonth) {
                if (taskDeadline.getDate() == selectedDay) {
                    return true;
                }
            }
        }

        return false;
    };

    useEffect(() => {
        let dateTitle = new Date(selectedDate).toDateString().slice(4, 7) + '. ' + new Date(selectedDate).getDate() + ', ' + new Date(selectedDate).getFullYear();

        navigation.setOptions({
            headerRight: () => {
                return (
                    <Text style={[styles.headerStyle, { right: 25 }]}>{selectedDate}</Text>
                );
            }
        });

        // reset listed tasks
        setListedItems(null);

        if (allTasks != null) {
            let todayTasks = [];

            // check deadline date
            for (let i = 0; i < allTasks.length; i++) {
                if (checkDate(allTasks[i].deadline)) {
                    // check if finished
                    if (allTasks[i].finished == false) {
                        todayTasks.push(allTasks[i]);
                    }
                }
            }
            
            if (todayTasks.length != 0) {
                setListedItems(todayTasks);
            }
        }
    }, [selectedDate]);

    async function getAllTasks () {
        let tasks = [];
        const colRef = collection(db, 'profiles', auth.currentUser.uid, 'tasks');
        const docsSnap = await getDocs(colRef);

        docsSnap.forEach(doc => {
            tasks.push(doc.data());
        });

        if (tasks.length != 0) {
            setAllTasks(tasks);
        }
    };

    function setDate (date) {
        if (date === selectedDate) { return; } 
        else { setSelectedDate(date); }
    };

    return (
        <View style={styles.screen}>
            {/* wait for listed items to get a value before trying to list them */}
            {listedItems ? listedItems.length >= 1 ? <View style={{ width: width > 550 ? '75%' : '90%', position: 'absolute', height: '100%', alignSelf: 'center' }}>
                <View style={{ flex: 1 }}/>
                <View style={{ flex: 1, width: 1, backgroundColor: 'black', marginLeft: width > 550 ? 22 : 19 }}/>
            </View> : null : null}

            <View>
                <DatePicker
                    mode='calendar'
                    onSelectedChange={date => setDate(date)}
                    selected={selectedDate}
                    current={selectedDate}
                    options={{
                        backgroundColor: Colors.theme,
                        textHeaderColor: 'black',
                        textDefaultColor: 'black',
                        textSecondaryColor: 'black',
                        selectedTextColor: 'white',
                        mainColor: Colors.subTheme,
                        borderColor: Colors.grey
                    }}
                />
                <View style={{ height: 0.5, backgroundColor: Colors.lightGrey }}/>
            </View>

            {!listedItems && <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Image
                    source={require('../assets/images/empty_box.png')}
                    style={{ height: 80, width: 80, marginBottom: 20 }}
                />
                <Text style={styles.text}>No items scheduled</Text>
                <Text style={styles.text}>on this date</Text>
            </View>}

            {listedItems && <FlatList
                data={listedItems}
                renderItem={taskData => 
                    <CalendarTaskItem task={taskData}/>
                }
            />}

            {/*listedItems ? <FlatList
                ListHeaderComponent={
                    <View>
                        <DatePicker
                            mode='calendar'
                            onSelectedChange={date => setDate(date)}
                            selected={selectedDate}
                            current={selectedDate}
                            options={{
                                backgroundColor: Colors.theme,
                                textHeaderColor: 'black',
                                textDefaultColor: 'black',
                                textSecondaryColor: 'black',
                                selectedTextColor: 'white',
                                mainColor: Colors.subTheme,
                                borderColor: Colors.grey
                            }}
                        />
                        <View style={{ height: 0.5, backgroundColor: Colors.lightGrey }}/>
                    </View>
                }
                data={listedItems}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <Image
                            source={require('../assets/images/empty_box.png')}
                            style={{ height: 80, width: 80, marginBottom: 20 }}
                        />
                        <Text style={styles.text}>No items scheduled</Text>
                        <Text style={styles.text}>on this date</Text>
                    </View>
                }
                // still need renderItem & ListFooterComponent
                //renderItem={}
                //ListFooterComponent={}
            /> : null*/}
        </View>
    );
};

CalendarScreen.navigationOptions = () => {
    return {
        title: null,
        headerShadowVisible: false,
        headerLeft: () => (
            <Text style={[styles.headerStyle, { left: 25 }]}>Calendar</Text>
        ),
        headerRight: null,
        tabBarIcon: ({ focused }) => {
            if (focused) {
                return (<Ionicons name='calendar' size={29} color='black'/>);
            } else {
                return (<CustomIcon name='calendar-outline' size={27} color='black'/>);
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
        top: 2
    },
    text: {
        color: 'black',
        fontSize: width > 550 ? 20 : 17
    }
});

export default CalendarScreen;