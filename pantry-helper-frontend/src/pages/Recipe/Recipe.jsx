'use client'
import React, { useState, useEffect } from 'react';
import './Recipe.css';
import { generateRecipes } from './action';
import { List, ListItem, CircularProgress } from '@mui/material';
import { fetchInventory } from '../../services/inventoryService';
import { useProfile } from '../../context/ProfileContext';
import { CloseOutlined } from '@ant-design/icons';
import { Input, Button, message } from 'antd';

const Recipe = () => {
  const { profile } = useProfile();
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [inventoryIngredients, setInventoryIngredients] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [recipeTitle, setRecipeTitle] = useState('');
  const [ingredientText, setIngredientText] = useState([]);
  const [recipeInstructions, setRecipeInstructions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const response = await fetchInventory(profile.currentPantry);
        setInventoryData(response.data);
        const pantryIngredients = response.data.map(item => item.Name);
        setInventoryIngredients(pantryIngredients);

        // Automatically add matching ingredients to selected ingredients
        const matchingIngredients = selectedIngredients.filter(ingredient =>
          pantryIngredients.some(pantryItem => 
            pantryItem.toLowerCase() === ingredient.toLowerCase()
          )
        );
        
        if (matchingIngredients.length > 0) {
          setSelectedIngredients(prevIngredients => {
            const newIngredients = [...new Set([...prevIngredients, ...matchingIngredients])];
            return newIngredients;
          });
        }
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      }
    };
    fetchInventoryData();
  }, [profile]);

  // Add handler for ingredient bubble clicks
  const handleIngredientClick = (ingredient) => {
    const normalizedIngredient = ingredient.trim().toLowerCase();
    
    // Check if ingredient is already in selected ingredients
    const isDuplicate = selectedIngredients.some(
      ing => ing.toLowerCase() === normalizedIngredient
    );
    
    if (!isDuplicate) {
      // Check if ingredient exists in pantry (case-insensitive)
      const pantryMatch = inventoryIngredients.find(
        pantryItem => pantryItem.toLowerCase() === normalizedIngredient
      );
      
      // Use the pantry name if it exists, otherwise use the input value
      const ingredientToAdd = pantryMatch || ingredient.trim();
      setSelectedIngredients([...selectedIngredients, ingredientToAdd]);
    }
  };

  // Add handler for removing selected ingredients
  const handleRemoveSelectedIngredient = (ingredientToRemove) => {
    console.log(selectedIngredients)
    console.log(ingredientToRemove)
    setSelectedIngredients(selectedIngredients.filter(
      ing => ing.toLowerCase() !== ingredientToRemove.toLowerCase()
    ));
  };

  // Update the generate handler
  const handleGenerate = async () => {
    if (selectedIngredients.length === 0) {
      message.error('Please select at least one ingredient');
      return;
    }
    
    setIsLoading(true);
    try {
      const ingredientsString = selectedIngredients.join(', ');
      const result = await generateRecipes(ingredientsString);
      setRecipeTitle(result[0].name);
      setIngredientText(result[0].ingredients);
      setRecipeInstructions(result[0].instructions);
    } catch (error) {
      console.error('Error generating recipe:', error);
      message.error('Failed to generate recipe');
    }
    setIsLoading(false);
  };

  return (
    <div id="recipe-main-container">
      <div id="recipe-column">
        <div id="recipe-header">
          <div id="recipe-welcome-text">
            <h2>Looking for some recipe inspiration?</h2>
            <p>Let's make it easy by using what we already have in the pantry!</p>
          </div>
          <div className="input-generate-wrapper">
            <Input
              placeholder="Add ingredient"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={(e) => {
                const value = e.target.value.trim();
                if (value) {
                  handleIngredientClick(value);
                  setInputValue('');
                }
              }}
            />
            <Button className="generate-button" 
              onClick={handleGenerate}
              loading={isLoading}
            >
              Generate
            </Button>
          </div>
        </div>

        <div id="recipe-pantry-ingredients">
          <h4>Available in Pantry:</h4>
          <div id="recipe-ingredient-bubbles">
            {inventoryIngredients.sort((a, b) => a.localeCompare(b)).map((ingredient, index) => {
              let statusClass;
              const item = inventoryData.find(item => item.Name === ingredient);
              if (!item || item.Quantity === 0) {
                statusClass = 'outOfStock';
              } else if (item.Quantity > 0 && item.Quantity <= 25) {
                statusClass = 'fewItemsLeft';
              } else {
                statusClass = 'inStock';
              }

              return (
                <span 
                  key={index} 
                  className={`bubble ${statusClass}`}
                  onClick={() => handleIngredientClick(ingredient)}
                  style={{ cursor: 'pointer' }}
                >
                  {ingredient}
                </span>
              );
            })}
          </div>
        </div>

        <div id="recipe-selected-ingredients">
          <h4>Ingredients:</h4>
          <div className="selected-ingredients-list">
            {selectedIngredients.map((ingredient, index) => (
              <span 
                key={index} 
                className="selected-ingredient"
                onClick={() => handleRemoveSelectedIngredient(ingredient)}
              >
                {ingredient} <CloseOutlined />
              </span>
            ))}
          </div>
        </div>

        {recipeTitle && (
          <div id="recipe-generated-result">
            <h3>{recipeTitle}</h3>
            <div className="recipe-content-wrapper">
              <div className="recipe-ingredients">
                <h4>Ingredients:</h4>
                <ul>
                  {ingredientText.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
              <div className="recipe-instructions">
                <h4>Instructions:</h4>
                {recipeInstructions.map((instruction, index) => (
                  <p key={index}>
                    <span className="step-number">{index + 1}.</span> {instruction}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipe;
