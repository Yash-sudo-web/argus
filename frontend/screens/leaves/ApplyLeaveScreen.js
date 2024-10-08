import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Modal, Button } from 'react-native';
import logo from '../../assets/images/argusLogo.png';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatBot from '../chatbot/chatbot';
import { Ionicons } from '@expo/vector-icons';

const ApplyLeavesScreen = () => {

  const [chatVisible, setChatVisible] = useState(false);
  const toggleChat = () => {
    setChatVisible(!chatVisible);
  };

  const [leaveType, setLeaveType] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [appliedDate, setAppliedDate] = useState(new Date());
  const [status, setStatus] = useState('Pending');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [dateType, setDateType] = useState('');
  const [user, setUser] = useState({
    _id: '',
    username: '',
    email: '',
  });


  const getJWT = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      return token;
    } catch (error) {
      console.error('Error retrieving JWT', error);
    }
  };

  const getUser = async () => {
    try {
      const token = await getJWT();
      const response = await axios.get("http://localhost:8080/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    }
    catch (error) {
      console.log("Failed to retrieve user:", error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const profilePictureUri = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wyNjYzN3wwfDF8c2VhcmNofDJ8fHByb2ZpbGV8ZW58MHx8fHwxNjk3NjIxOTkyfDA&ixlib=rb-4.0.3&q=80&w=400';
  
  const showDatePicker = (type) => {
    setDateType(type);
    setCurrentDate(type === 'start' ? startDate : endDate);
    setDateModalVisible(true);
  };

  const handleConfirm = () => {
    if (dateType === 'start') {
      setStartDate(currentDate);
      if (endDate <= currentDate) {
        const newEndDate = new Date(currentDate);
        newEndDate.setDate(newEndDate.getDate() + 1);
        setEndDate(newEndDate);
      }
    } else if (dateType === 'end') {
      setEndDate(currentDate);
    }
    setDateModalVisible(false);
  };

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const handleSubmit = () => {
    const body = {
      employeeId: user._id, 
      leaveType,
      startDate,
      endDate,
      reason,
      appliedOn: appliedDate,
      status,
    };
    const resposne = axios.post('http://localhost:8080/leave', body)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <Image source={{ uri: profilePictureUri }} style={styles.profilePicture} />
      </View>
      <Text style={styles.title}>Apply for Leaves</Text>
      <Text style={styles.subheader}>Employee Id</Text>
      <TextInput
        style={styles.input}
        placeholder="Employee Id"
        value="13422"
        editable={false}
      />

      <Text style={styles.subheader}>Leave Type</Text>
      <Picker
        selectedValue={leaveType}
        style={styles.input}
        onValueChange={(itemValue) => setLeaveType(itemValue)}
      >
        <Picker.Item label="Select type of Leave" value="" />
        <Picker.Item label="Sick Leave" value="Sick" />
        <Picker.Item label="Casual Leave" value="Casual" />
        <Picker.Item label="Earned Leave" value="Earned" />
        <Picker.Item label="Unpaid Leave" value="Unpaid" />
      </Picker>

      <View style={styles.row}>
        <View style={styles.halfInputContainer}>
          <Text style={styles.subheader}>Start Date</Text>
          <TouchableOpacity onPress={() => showDatePicker('start')} style={styles.input}>
            <Text style={{ color: '#fff' }}>{startDate.toDateString()}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.halfInputContainer}>
          <Text style={styles.subheader}>End Date</Text>
          <TouchableOpacity onPress={() => showDatePicker('end')} style={styles.input}>
            <Text style={{ color: '#fff' }}>{endDate.toDateString()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.subheader}>Leave Status</Text>
      <TextInput
        style={styles.input}
        placeholder="Status"
        value={status}
        editable={false}
      />

      <Text style={styles.subheader}>Reason</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Provide a Reason for your leave"
        value={reason}
        onChangeText={(text) => setReason(text)}
        multiline={true}
        numberOfLines={4}
      />

      <Text style={styles.subheader}>Applied on</Text>
      <TextInput
        style={styles.input}
        value={appliedDate.toDateString()}
        editable={false}
      />

      <TouchableOpacity onPress={handleSubmit} style={styles.applyButton}>
        <Text style={styles.applyButtonText}>Apply</Text>
      </TouchableOpacity>

      <Modal
        visible={dateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <View style={styles.dateSelector}>
              <Button title="Previous" onPress={() => changeDate(-1)} />
              <Text style={styles.selectedDate}>{currentDate.toDateString()}</Text>
              <Button title="Next" onPress={() => changeDate(1)} />
            </View>
            <View style={styles.modalButtons}>
              <Button title="Confirm" onPress={handleConfirm} color="#FF6665" />
              <Button title="Cancel" onPress={() => setDateModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.fab} onPress={toggleChat}>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
      </TouchableOpacity>

      {chatVisible && (<ChatBot visible={chatVisible} toggleChat={toggleChat} />)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 50,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6665',
    marginBottom: 10,
    textAlign: 'left',
  },
  input: {
    backgroundColor: '#444',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: 'center',
  },
  textArea: {
    backgroundColor: '#444',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    width: '48%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 320,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  selectedDate: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  applyButton: {
    backgroundColor: '#FF6665',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    width: 100,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff5c5c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default ApplyLeavesScreen;