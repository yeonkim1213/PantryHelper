import React, { useState } from 'react'
import './Help.css'
import { SearchOutlined, MailOutlined } from '@ant-design/icons'

const Help = () => {
  const categories = {
    General: [
      {
        question: 'How do I unsubscribe from the notifications?',
        answer:
          'If you would like to unsubscribe from the notifications, you can visit the profile page to manage your email notifications.'
      },
      {
        question: 'Is my personal information secure?',
        answer:
          'We take your privacy seriously and implement a variety of security measures to maintain the safety of your personal information.'
      },
      {
        question: 'Can I donate homemade food?',
        answer:
          'Most pantries cannot accept homemade food due to safety regulations. Please donate packaged or canned goods, or check with your local pantry for their guidelines.'
      },
      {
        question: 'What should I do if I encounter a bug or technical issue?',
        answer:
          'If you experience technical issues, please contact our support team.'
      },
      {
        question: 'How do I reset my password?',
        answer:
          "You can reset your password by going to the login page and clicking 'Forgot Password.' Follow the prompts to reset it."
      },
      {
        question: 'How frequently is the inventory updated?',
        answer:
          'Inventory is updated daily as items are donated and distributed. For the most accurate information, please check back regularly.'
      },

      {
        question:
          'Can I suggest new features or improvements for Pantry Helper?',
        answer:
          'Yes, we welcome feedback! Please send suggestions to our support email.'
      }
    ],
    Login: [
      {
        question: "I don't have a Google email. Is there any way to login?",
        answer:
          "We are currently only supporting Google logins. If you do not have a Google account, you'll need to create one to access Pantry Helper."
      },
      {
        question: 'How do I log in as a staff member?',
        answer:
          'Your pantry will provide you with a unique code for staff registration. Use this code during the sign-up process to gain staff access.'
      },

      {
        question:
          "Why can't I log in even though I entered my Google credentials?",
        answer:
          'Ensure you’ve allowed Pantry Helper access to your Google account. You may need to reauthorize access if there’s an issue.'
      },
      {
        question: 'What if I’m logged in on multiple devices?',
        answer:
          'You can be logged in on multiple devices simultaneously, but be mindful of security if you share a device.'
      }
    ],
    Pantry: [
      {
        question: 'When does the pantry open?',
        answer:
          'Please contact your local pantry for their specific hours of operation. Each pantry may have different operating hours.'
      },
      {
        question:
          'Is there a limit to how much food I can receive from the pantry?',
        answer:
          'Each pantry may have different guidelines on the amount of food you can receive. Please contact your local pantry for specific details.'
      },

      {
        question: 'How can I find out about special events at the pantry?',
        answer:
          "Events are listed in the 'Events' page of the website. You can also subscribe to receive notifications for upcoming events."
      },
      {
        question: 'Is there parking available near the pantry?',
        answer:
          'Parking availability varies. Please check with your local pantry for details on nearby parking.'
      },
      {
        question: 'Can I request specific items at the pantry?',
        answer:
          'Requests for specific items can be made through the website. Pantry staff will notify you if the item becomes available.'
      }
    ],
    Donations: [
      {
        question: 'Can I donate food directly to the pantry?',
        answer:
          'Please check with your local pantry for the most needed items and drop-off times.'
      },
      {
        question: 'Can I make a monetary donation to the pantry?',
        answer:
          'Please check with your local pantry regarding their monetary donation options.'
      },

      {
        question: 'Are there specific items that are in high demand?',
        answer:
          'High-demand items vary by season and pantry. Please check with your local pantry.'
      },

      {
        question: 'Do I need to notify someone before bringing a donation?',
        answer:
          'Notifying the pantry beforehand is appreciated, especially for large donations, but not always necessary.'
      },
      {
        question: 'Can I volunteer at the pantry instead of donating items?',
        answer:
          'Yes, most pantries accept volunteers. Contact your local pantry to learn about volunteer opportunities.'
      },
      {
        question: 'Are food donations tax-deductible?',
        answer:
          'Please consult with a tax professional, but in many cases, food donations are eligible for tax deductions.'
      },
      {
        question: 'Can I donate gift cards to the pantry?',
        answer:
          'Some pantries accept gift cards as donations. Check with your local pantry to see if they do.'
      }
    ],
    Account: [
      {
        question: 'How do I reset my password?',
        answer:
          'We currently only support Google login, so you need to reset your Google password.'
      },

      {
        question: 'How can I delete my account?',
        answer:
          "If you wish to delete your account, please go to your account settings and select 'Delete Account.' Keep in mind that this action is irreversible."
      }
    ]
  }

  const allQuestions = Object.keys(categories).reduce((acc, category) => {
    return [...acc, ...categories[category]]
  }, [])

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const getCurrentCategoryQuestions = () => {
    let questions
    if (selectedCategory === 'All') {
      questions = allQuestions
    } else {
      questions = categories[selectedCategory] || []
    }

    // Sort questions alphabetically
    return questions.sort((a, b) => a.question.localeCompare(b.question))
  }

  const filteredQuestions = getCurrentCategoryQuestions().filter(faq => {
    return (
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handlePageChange = direction => {
    if (
      direction === 'next' &&
      currentPage < Math.ceil(filteredQuestions.length / itemsPerPage)
    ) {
      setCurrentPage(currentPage + 1)
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedQuestions = filteredQuestions.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return (
    <div className='faq'>
      <div className='help-container'>
        <div className='help-header'>
          <div className='category-buttons'>
            <button
              className={selectedCategory === 'All' ? 'active-category' : ''}
              onClick={() => {
                setSelectedCategory('All')
                setCurrentPage(1)
              }}
            >
              All
            </button>
            {Object.keys(categories).map(category => (
              <button
                key={category}
                className={
                  category === selectedCategory ? 'active-category' : ''
                }
                onClick={() => {
                  setSelectedCategory(category)
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
              >
                {category}
              </button>
            ))}
          </div>

          <div className='search-bar-container'>
            <SearchOutlined className='search-icon' />
            <input
              type='text'
              className='search-input'
              placeholder='Search'
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>

        <div className='help-content'>
          <div className='contact-info'>
            <div className='email-wrapper'>
              <MailOutlined /> pantryhelper.24@gmail.com
            </div>
          </div>

          {displayedQuestions.length > 0 ? (
            <>
              {displayedQuestions.map((faq, index) => (
                <div key={index} className='faq-item'>
                  <p>
                    <strong>{faq.question}</strong>
                  </p>
                  <p>{faq.answer}</p>
                </div>
              ))}

              <div className='pagination'>
                <button
                  onClick={() => handlePageChange('prev')}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of{' '}
                  {Math.ceil(filteredQuestions.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => handlePageChange('next')}
                  disabled={
                    currentPage ===
                    Math.ceil(filteredQuestions.length / itemsPerPage)
                  }
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <p>No results found.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Help
