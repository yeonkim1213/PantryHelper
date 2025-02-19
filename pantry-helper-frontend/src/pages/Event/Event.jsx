// src/components/Event/Event.jsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Event.css';
import { useEmail } from '../../context/EmailContext';
import {
  fetchEvent,
  addEvent,
  updateEvent,
  deleteEvent,
  fetchEventsByPantry,
} from '../../services/eventService';
import { addNotification } from '../../services/notificationService';
import {  getPantryName } from '../../services/pantryService';
import { getEmailsByPantryId, getProfileIDbyPantry } from '../../services/subscriptionListService';
import { useProfile } from '../../context/ProfileContext';
import { fetchPantryUsers } from '../../services/pantryUserService';
import { Button, Card, Pagination, Image, Modal, Input, DatePicker, Form, Checkbox, Row, Col, message } from 'antd';
import dayjs from 'dayjs';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';


const getEventColor = (iconPath) => {
  if (!iconPath) return '#F47174';


  if (iconPath.includes('foodDriveIcon.png') || 
      iconPath.includes('foodTruckIcon.png') || 
      iconPath.includes('cannedFoodIcon.png')) {
    return '#4fc0e3'; // Blue
  } else if (iconPath.includes('moneyIcon.png')) {
    return '#8ad142'; // Green
  } else {
    return '#F47174'; // Red
  }
};

const Event = () => {
  const { sendEventEmail, sendEventCancelEmail } = useEmail();
  const [events, setEvents] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [icons] = useState([
    '/events_icons/cannedFoodIcon.png',
    '/events_icons/christmasIcon.png',
    '/events_icons/dishIcon.png',
    '/events_icons/eventIcon.png',
    '/events_icons/foodDriveIcon.png',
    '/events_icons/foodTruckIcon.png',
    '/events_icons/moneyIcon.png',
    '/events_icons/newYearIcon.png',
    '/events_icons/thanksgivingIcon.png',
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    image: '/events_icons/eventIcon.png',
    pantryID: ''
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [itemsPerPage] = useState(6);
  const { profile } = useProfile();
  const [userAuthority, setUserAuthority] = useState('')
  const pageSize = 5; // 5 events per page
  const [form] = Form.useForm();
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [includePastEvents, setIncludePastEvents] = useState(false);

  useEffect(() => {
    // Fetch pantry user authority whenever currentPantry updates
    const fetchPantryUser = async () => {
      try {
        const response = await fetchPantryUsers();
        const pantryUsers = response.data;
  
        // Find user authority for the current profileID and currentPantry
        const currentAuthority = pantryUsers.find(
          user => user.profileID === profile?.profileID && user.pantryID === profile.currentPantry
        )?.userAuthority;
  
        setUserAuthority(currentAuthority || null); // Set or clear user authority
      } catch (error) {
        console.error('Error fetching pantry users:', error);
      }
    };
  
    if (profile ) {
      fetchPantryUser();
    }
  }, [profile]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (!profile || !profile.currentPantry) return;
        
        const response = await fetchEventsByPantry(profile.currentPantry);
        setEvents(response.data);
        
        const formattedCalendarEvents = response.data.map(event => ({
          id: event.eventID,
          title: event.EventTitle,
          start: event.EventDate,
          end: event.EventDate,
          backgroundColor: getEventColor(event.IconPath),
          borderColor: getEventColor(event.IconPath),
          textColor: '#FFFFFF'
        }));
        setCalendarEvents(formattedCalendarEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [profile]);

  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(events.length / itemsPerPage);

  const handleNextPage = () => {
    if (indexOfLastEvent < events.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Event Modal Functions
  const handleOpenEventModal = () => {
    form.resetFields();
    setSelectedIcon(null);
    setEditingIndex(null);
    setIsEventModalOpen(true);
  };

  const handleCloseEventModal = () => {
    form.resetFields();
    setSelectedIcon(null);
    setIsEventModalOpen(false);
    setEditingIndex(null);
  };

  const handleAddEvent = async (values) => {
    if (values.title && values.date && values.description.length <= 200 && values.image) {
      try {
        const response = await addEvent({
          pantryID: profile.currentPantry,
          EventTitle: values.title,
          EventDetail: values.description,
          IconPath: values.image,
          EventDate: values.date,
          EventLocation: values.location,
        });

        setEvents([...events, response.data.event]);

        const emailResponse = await getEmailsByPantryId(profile.currentPantry);
        const pantryResponse = await getPantryName(profile.currentPantry);
        const pantryName = pantryResponse.data.PantryName;
        const subscribedEmails = emailResponse.data.map((sub) => sub.email);

        const notificationList = await getProfileIDbyPantry(profile.currentPantry);

        for (const user of notificationList.data) {
          if (user.profileID != null) {
            await addNotification({
              profileID: user.profileID,
              pantryID: profile.currentPantry,
              detail: "New Event: "+ values.title,
              isRead: false,
            });
          }
        }

        await sendEventEmail({
          title: values.title,
          date: values.date,
          location: values.location,
          description: values.description,
          emails: subscribedEmails,
          pantryName: pantryName
        });

        handleCloseEventModal();
        message.success('Event added and notification emails sent successfully');
      } catch (error) {
        console.error('Error adding event:', error);
        message.error('Failed to add event or send notifications');
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const eventToDelete = events.find(event => event.eventID === eventId);
      if (!eventToDelete) {
        message.error('Event not found');
        return;
      }

      // Get emails and pantry name first
      const [emailResponse, pantryResponse] = await Promise.all([
        getEmailsByPantryId(profile.currentPantry),
        getPantryName(profile.currentPantry)
      ]);

      const subscribedEmails = emailResponse.data.map(sub => sub.email);
      const pantryName = pantryResponse.data.PantryName;

      // Delete the event
      await deleteEvent(eventId, profile.currentPantry);

      // Update UI
      setEvents(prevEvents => prevEvents.filter(event => event.eventID !== eventId));
      setCalendarEvents(prevCalendarEvents => 
        prevCalendarEvents.filter(event => event.id !== eventId)
      );

      const notificationList = await getProfileIDbyPantry(profile.currentPantry);

      for (const user of notificationList.data) {
        if (user.profileID != null) {
          await addNotification({
            profileID: user.profileID,
            pantryID: profile.currentPantry,
            detail: "Event Cancelation: "+ eventToDelete.EventTitle,
            isRead: false,
          });
        }
      }

      // Send cancellation email
      await sendEventCancelEmail({
        title: eventToDelete.EventTitle,
        date: eventToDelete.EventDate,
        location: eventToDelete.EventLocation,
        emails: subscribedEmails,
        pantryName: pantryName
      });

      message.success('Event deleted and cancellation emails sent successfully');

      // Adjust pagination if needed
      const remainingEvents = events.length - 1;
      const maxPage = Math.ceil(remainingEvents / pageSize);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }

    } catch (error) {
      console.error('Error in handleDeleteEvent:', error);
      message.error('Failed to delete event or send cancellation emails');
    }
  };

  const handleIconChange = (iconUrl) => {
    setNewEvent({ ...newEvent, image: iconUrl });
  };

  const handleEditEvent = (eventId) => {
    const eventToEdit = events.find(e => e.eventID === eventId);
    if (!eventToEdit) return;

    setEditingIndex(events.findIndex(e => e.eventID === eventId));
    setSelectedIcon(eventToEdit.IconPath);
    form.setFieldsValue({
      title: eventToEdit.EventTitle,
      date: dayjs(eventToEdit.EventDate),
      location: eventToEdit.EventLocation,
      description: eventToEdit.EventDetail,
      image: eventToEdit.IconPath
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEdit = async (values) => {
    try {
      const eventId = events[editingIndex].eventID;
      const updatedEvent = {
        EventTitle: values.title,
        EventDate: values.date.format('YYYY-MM-DD'),
        EventLocation: values.location,
        EventDetail: values.description,
        IconPath: values.image
      };

      await updateEvent(eventId, updatedEvent);
      
      const newEvents = [...events];
      newEvents[editingIndex] = {
        ...newEvents[editingIndex],
        ...updatedEvent
      };
      setEvents(newEvents);

      const updatedCalendarEvents = calendarEvents.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            title: updatedEvent.EventTitle,
            start: updatedEvent.EventDate,
            end: updatedEvent.EventDate,
            backgroundColor: getEventColor(updatedEvent.IconPath),
            borderColor: getEventColor(updatedEvent.IconPath)
          };
        }
        return event;
      });
      setCalendarEvents(updatedCalendarEvents);

      handleCloseEventModal();
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error updating event');
    }
  };

  const dateCellRender = (value) => {

    const dateEvents = events.filter(event => 
      dayjs(event.EventDate).format('YYYY-MM-DD') === value.format('YYYY-MM-DD')
    );

    return (
      <div>
        {dateEvents.map(event => (
          <div 
            key={event.eventID} 
            className="calendar-event-dot" 
            title={event.EventTitle}
          />
        ))}
      </div>
    );
  };

  const onSelect = (value) => {
   
    const selectedEvents = events.filter(event => 
      dayjs(event.EventDate).format('YYYY-MM-DD') === value.format('YYYY-MM-DD')
    );

  };


  const getCurrentEvents = () => {
    const sortedEvents = [...events].sort((a, b) => 
      dayjs(a.EventDate).valueOf() - dayjs(b.EventDate).valueOf()
    );
    
    if (!includePastEvents) {
      return sortedEvents.filter(event => 
        dayjs(event.EventDate).isAfter(dayjs(), 'day')
      );
    }
    return sortedEvents;
  };

  const handleSubmit = async (values) => {
    if (editingIndex !== null) {
      await handleSaveEdit(values);
    } else {
      await handleAddEvent(values);
    }
    handleCloseEventModal();
  };

  const handleIconSelect = (icon) => {
    setSelectedIcon(icon);
    form.setFieldsValue({ image: icon });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const calendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    events: calendarEvents,
    headerToolbar: {
      left: 'prev',
      center: 'title',
      right: 'next'
    },
    eventClick: handleEventClick,
    eventDisplay: 'block',
    displayEventTime: false,
    height: '100%'
  };

  if (!profile || !profile.currentPantry) {
    return <div>Loading...</div>;
  }

  return (
    <div id="events-page">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <div className="events-controls">
            <Checkbox 
              checked={includePastEvents}
              onChange={(e) => setIncludePastEvents(e.target.checked)}
            >
              Include past events
            </Checkbox>
            <div style={{ flex: 1 }}></div>
            {(userAuthority === 'admin' || userAuthority === 'staff') && (
              <Button 
                id="add-event-btn"
                type="primary" 
                onClick={handleOpenEventModal}
              >
                New Event
              </Button>
            )}
          </div>
          
          {getCurrentEvents()
            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
            .map((event) => (
              <Card key={event.eventID} id="event-card">
                <div id="event-content">
                  <div id="event-icon">
                    <img
                      src={`${event.IconPath}`}
                      alt="Event Type"
                      width="24"
                      height="24"
                    />
                  </div>
                  <div id="event-details">
                    <div className="event-title-row">
                      <div id="event-title">{event.EventTitle}</div>
                      {(userAuthority === 'admin' || userAuthority === 'staff') && (
                        <div className="event-actions">
                          <button onClick={() => handleEditEvent(event.eventID)} className="edit-btn">
                            <EditOutlined />
                          </button>
                          <button onClick={() => handleDeleteEvent(event.eventID)} className="delete-btn">
                            <DeleteOutlined />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="event-info-row">
                      <div id="event-location">{event.EventLocation}</div>
                      <div id="event-date">{dayjs(event.EventDate).format('MMMM D, YYYY')}</div>
                    </div>
                    <div id="event-description">{event.EventDetail}</div>
                  </div>
                </div>
              </Card>
            ))}
          
          <div className="pagination-wrapper">
            <Pagination
              current={currentPage}
              onChange={handlePageChange}
              total={getCurrentEvents().length}
              pageSize={pageSize}
              showSizeChanger={false}
            />
          </div>
        </Col>
        
        <Col span={12}>
          <FullCalendar {...calendarOptions} />
        </Col>
      </Row>

      <Modal
        title={editingIndex !== null ? 'Edit Event' : 'Add New Event'}
        open={isEventModalOpen}
        onCancel={handleCloseEventModal}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="image"
            rules={[{ required: true, message: 'Please select an icon' }]}
            style={{ display: 'none' }}
          >
            <Input />
          </Form.Item>

          <div className="icon-selection">
            {icons.map((icon, index) => (
              <img
                key={index}
                src={icon}
                alt={`Icon ${index + 1}`}
                className={`icon-circle ${selectedIcon === icon ? 'selected' : ''}`}
                onClick={() => handleIconSelect(icon)}
              />
            ))}
          </div>

          <Form.Item
            name="title"
            label="Event Title"
            rules={[{ required: true, message: 'Please enter event title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="date"
            
            label="Event Date"
            rules={[{ required: true, message: 'Please select event date' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                return current && current < dayjs().startOf('day');
              }}
            />
          </Form.Item>

          <Form.Item
            name="location"
            label="Event Location"
            rules={[{ required: true, message: 'Please enter event location' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Event Description"
            rules={[
              { required: true, message: 'Please enter event description' },
              { max: 200, message: 'Description cannot exceed 200 characters' }
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              {editingIndex !== null ? 'Save Changes' : 'Add Event'}
            </Button>
            <Button onClick={handleCloseEventModal}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};


const renderEventContent = (eventInfo) => {
  return (
    <div className="fc-event-title">{eventInfo.event.title}</div>
  );
};


const handleEventClick = (clickInfo) => {
  console.log('Event clicked:', clickInfo.event);
};

const handleDateClick = (arg) => {
  console.log('Date clicked:', arg.dateStr);
};

export default Event;
