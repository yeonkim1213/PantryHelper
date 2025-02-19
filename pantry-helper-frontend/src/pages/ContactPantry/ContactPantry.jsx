import React, { useState, useEffect } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { 
    getPantryName,
    getPantryEmail, 
    getPantryLocation,
    getPantryPhone,
    fetchPantries
  } from '../../services/pantryService';
import { useEmail } from '../../context/EmailContext';
import { 
  Input, 
  Button, 
  Modal,
  message, 
  Form,
  Spin
} from 'antd';
import './ContactPantry.css';


const ContactPantry = () => {
  const { profile } = useProfile();
  const { sendContactEmail } = useEmail();
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState(1);
  const [userAuthority, setUserAuthority] = useState('')
  const[pantries, setPantries] = useState([]);
  const[pantryLocation, setLocation] = useState([]);
  const[pantryPhone, setPhone] = useState([]);
  const[pantryEmail, setEmail] = useState([]);
  const[pantryName, setName] = useState([]);
  const[pantryID, setPantryID] = useState(() => (profile ? profile.currentPantry : "None" ));
  const [pantryName1, setPantryName] = useState(() => (pantries.find(item => item.pantryID === pantryID)?.name || "No pantry selected"));
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadPantries = async () => {
      try {
        const data = await fetchPantries();
        setPantries(data);
      } catch (error) {
        console.error('Error fetching pantries:', error);
      }
    };
    loadPantries();
  }, []);

  useEffect(() => {
      const updatePage = async () => {
        try {
          setLoading(true);
          if (profile && profile.currentPantry) {
            setPantryID(profile.currentPantry);
            const [locationData, phoneData, emailData, nameData] = await Promise.all([
              getPantryLocation(profile.currentPantry),
              getPantryPhone(profile.currentPantry),
              getPantryEmail(profile.currentPantry),
              getPantryName(profile.currentPantry)
            ]);
            
            setLocation(locationData.data[0].Location);
            setPhone(phoneData.data[0].Phone);
            setEmail(emailData.data[0].Email);
            setName(nameData.data[0].Name);
          }
        } catch (error) {
          console.error('Error updating page:', error);
          message.error('Failed to load pantry information');
        } finally {
          setLoading(false);
        }
      }
      updatePage();
  }, [profile]);

  useEffect(() => {
    if (pantries.length > 0 && pantryID) {
      const currentPantry = pantries.find(item => item.pantryID === pantryID);
      if (currentPantry) {
        setPantryName(currentPantry.name);
      }
    }
  }, [pantries, pantryID]);
  
  const handleEmailModalOpen = () => {
    setIsEmailModalVisible(true);
    setNewSubject('');
    setNewBody('');
  };

  const handleEmailModalClose = () => {
    setIsEmailModalVisible(false);
  };

  const handleEmailSubmit = async () => {
    try {
      if (!newSubject.trim()) {
        message.error('Please enter email subject');
        return;
      }

      if (!newBody.trim()) {
        message.error('Please enter email body');
        return;
      }

      await sendContactEmail({
        subject: newSubject.trim(),
        body: newBody.trim(),
        pantryEmail: pantryEmail,
        senderEmail: profile.email
      });

      message.success('email sent succesfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      message.error('Failed to send email');
    }
  };

  return (
    <div className="Contact-container">
      <div className="Contact-content">
        <div id="pantry-contact">
          {loading ? (
            <div className="loading-container">
             
            </div>
          ) : (
            <>
              <h2>{pantryName}</h2>
              <p><b>Location: </b>{pantryLocation}</p>
              <p><b>Phone: </b>{pantryPhone}</p>
              <p><b>Email: </b>{pantryEmail}</p>
              {pantryEmail !== "N/A" && (
                <>
                  <p>You can send an email to the pantry, directly from Pantry Helper!</p>
                  <Button type="primary" onClick={handleEmailModalOpen}>
                    Send Email
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Email Modal */}
      <Modal
        title="Send Email"
        visible={isEmailModalVisible}
        onCancel={handleEmailModalClose}
        footer={null}
      >
        <Form onFinish={handleEmailSubmit} layout="vertical">
          <Form.Item
            name="emailSubject"
            label="Subject"
            rules={[{ required: true, message: 'Please enter email subject' }]}
          >
            <Input 
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Enter email subject"
            />
          </Form.Item>
          <Form.Item
            name="emailBody"
            label="Body"
            rules={[{ required: true, message: 'Please enter email body' }]}
          >
            <Input.TextArea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Enter email body"
              rows={10}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Send Email
            </Button>
          </Form.Item>
          <p style={{ color: 'red', fontSize: 'small', marginBottom: '10px' }}>
            *Your email will be known to the pantry.
            </p>
        </Form>
      </Modal>
    </div>
  );
};

export default ContactPantry;
