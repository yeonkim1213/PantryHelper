import React from 'react';
import { Modal, Form, Input, DatePicker, InputNumber, Select } from 'antd';
import { useState } from 'react';

function AddItemModal({ open, onCreate, onCancel }) {
    const [form] = Form.useForm();
    const [options, setOptions] = useState(pantryItems);

    const handleSearch = (value) => {
        // Filter the items to display those that match the input value
        const filteredOptions = pantryItems.filter((item) =>
          item.toLowerCase().includes(value.toLowerCase())
        );
    
        // If the input value doesn't match any item, allow free input
        if (!filteredOptions.includes(value) && value) {
          setOptions([value, ...filteredOptions]);
        } else {
          setOptions(filteredOptions);
        }
      };

    return (
        <Modal
            open={open}
            title="Add New Inventory Item"
            okText="Add"
            cancelText="Cancel"
            onCancel={onCancel}
            onOk={() => {
                form
                    .validateFields()
                    .then(values => {
                        form.resetFields();
                        onCreate(values);
                    })
                    .catch(info => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form
                form={form}
                layout="vertical"
                name="form_in_modal"
            >
            <Form.Item
                    name="name"
                    label="Product Name"
                    rules={[{ required: true, message: 'Please input the name of the item!' }]}
                    >
                    <Select
                        showSearch
                        placeholder="Select or type to add"
                        optionFilterProp="children"
                        onSearch={handleSearch}
                        filterOption={false} // Disable default filtering to handle custom search logic
                        notFoundContent={null} // Show empty message if no results are found
                    >
                        {options.map((item) => (
                        <Select.Option key={item} value={item}>
                            {item}
                        </Select.Option>
                        ))}
                    </Select>
                    </Form.Item>
                <Form.Item
                    name="expirationDate"
                    label="Expiration Date"
                    rules={[{required: true, message: 'Please input the expiration date of the item!'}]}>
                    <DatePicker />
                </Form.Item>
                <Form.Item
                    name="quantity"
                    label="Quantity"
                    rules={[{ required: true, message: 'Please select quantity' },
                    { type: 'number', min: 1, message: 'Quantity must be at least 1' }]}
                >
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    name="incomingDate"
                    label="Incoming Date"
                    rules={[{ required: true, message: 'Please select the incoming date!' }]}
                >
                    <DatePicker />
                </Form.Item>
                {/* <Form.Item
                    name="location"
                    label="Location"
                    rules={[{ required: true, message: 'Please select or add the location of the item!' }]}
                >
                    <Select
                        mode="combobox"
                        placeholder="Select or add a location"
                        style={{ width: '100%' }}
                    >
                        <Select.Option value="Table 1">Table 1</Select.Option>
                        <Select.Option value="Table 2">Table 2</Select.Option>
                        <Select.Option value="Table 3">Table 3</Select.Option>
                        <Select.Option value="Refrigerator 1">Refrigerator 1</Select.Option>
                        <Select.Option value="Refrigerator 2">Refrigerator 2</Select.Option>
                        <Select.Option value="Freezer">Freezer</Select.Option>
                    </Select>
                </Form.Item> */}


            </Form>
        </Modal>
    );
}

const pantryItems = [
    'Apple', 'Banana', 'Carrot', 'Bread', 'Butter', 'Cheese', 'Chicken', 'Rice', 'Pasta',
    'Tomato', 'Potato', 'Onion', 'Garlic', 'Milk', 'Eggs', 'Flour', 'Sugar', 'Salt', 'Pepper',
    'Cucumber', 'Spinach', 'Yogurt', 'Cereal', 'Oats', 'Beans', 'Lettuce', 'Orange', 'Grapes',
    'Fish', 'Beef', 'Peanut Butter', 'Jam', 'Honey', 'Almonds', 'Walnuts', 'Olive Oil', 'Vinegar',
    'Coffee', 'Tea', 'Juice', 'Frozen Vegetables', 'Frozen Fruits', 'Ketchup', 'Mustard', 'Soy Sauce',
    'Maple Syrup', 'Pancake Mix', 'Cookies', 'Crackers', 'Soup', 'Canned Tomatoes', 'Canned Beans',
    'Canned Corn', 'Canned Tuna', 'Granola Bars', 'Chips', 'Pretzels', 'Candy', 'Spaghetti',
    'Noodles', 'Macaroni', 'Brown Rice', 'White Rice', 'Coconut Milk', 'Tofu', 'Salmon', 'Shrimp',
    'Pork', 'Turkey', 'Bacon', 'Sausage', 'Mushrooms', 'Zucchini', 'Bell Peppers', 'Broccoli',
    'Cauliflower', 'Eggplant', 'Celery', 'Peas', 'Corn', 'Beets', 'Cherries', 'Strawberries', 
    'Blueberries', 'Raspberries', 'Blackberries', 'Kiwi', 'Pineapple', 'Mango', 'Papaya', 
    'Avocado', 'Cabbage', 'Brussels Sprouts', 'Lentils', 'Quinoa', 'Couscous', 'Barley',
    'Chia Seeds', 'Flax Seeds', 'Sunflower Seeds', 'Pumpkin Seeds', 'Cashews', 'Pistachios', 
    'Pecans', 'Raisins', 'Dried Cranberries', 'Dried Apricots', 'Dates', 'Prunes', 'Oregano', 
    'Basil', 'Thyme', 'Rosemary', 'Parsley', 'Dill', 'Cilantro', 'Chili Powder', 'Cinnamon',
    'Paprika', 'Cumin', 'Turmeric', 'Ginger', 'Bay Leaves', 'Ground Black Pepper', 'Red Pepper Flakes',
    'Mustard Seeds', 'Cardamom', 'Coriander', 'Fennel Seeds', 'Cloves', 'Nutmeg', 'Vanilla Extract',
    'Baking Soda', 'Baking Powder', 'Cornstarch', 'Gelatin', 'Agar Agar', 'Almond Flour', 'Coconut Flour',
    'All-Purpose Flour', 'Whole Wheat Flour', 'Bread Flour', 'Self-Rising Flour', 'Cake Flour',
    'Pastry Flour', 'Yeast', 'Active Dry Yeast', 'Instant Yeast', 'Sourdough Starter', 'Pita Bread',
    'Naan', 'Bagels', 'English Muffins', 'Tortillas', 'Pita Chips', 'Corn Tortillas', 'Whole Wheat Tortillas',
    'Spelt Bread', 'Rye Bread', 'Sourdough Bread', 'Ciabatta', 'Baguette', 'Croissants', 'Danish Pastry',
    'Muffins', 'Donuts', 'Pretzels', 'Pizza Dough', 'Pie Crust', 'Graham Crackers', 'Oreo Cookies',
    'Digestive Biscuits', 'Shortbread Cookies', 'Butter Cookies', 'Sugar Cookies', 'Brownies', 
    'Cupcakes', 'Chocolate Cake', 'Vanilla Cake', 'Red Velvet Cake', 'Carrot Cake', 'Banana Bread', 
    'Zucchini Bread', 'Cornbread', 'Pancakes', 'Waffles', 'French Toast', 'Cinnamon Rolls', 'Scones',
    'Fruit Tart', 'Lemon Bars', 'Cheesecake', 'Apple Pie', 'Pumpkin Pie', 'Pecan Pie', 'Key Lime Pie',
    'Banoffee Pie', 'Tiramisu', 'Meringue', 'Macarons', 'Eclairs', 'Cream Puffs', 'Profiteroles',
    'Crepes', 'Churros', 'Cannoli', 'Baklava', 'Rice Pudding', 'Tapioca Pudding', 'Chocolate Pudding',
    'Custard', 'Flan', 'Creme Brulee', 'Mousse', 'Jelly', 'Marshmallows', 'Peanut Butter Cups',
    'Caramels', 'Truffles', 'Hard Candy', 'Gummy Bears', 'Licorice', 'Fudge', 'Chocolate Bars',
    'White Chocolate', 'Dark Chocolate', 'Milk Chocolate', 'Cocoa Powder', 'Chocolate Chips',
    'Butterscotch Chips', 'Marzipan', 'Fondant', 'Icing Sugar', 'Food Coloring', 'Sprinkles',
    'Meringue Powder', 'Whipped Cream', 'Cool Whip', 'Ice Cream', 'Frozen Yogurt', 'Gelato', 
    'Sorbet', 'Popsicles', 'Fruit Juice Concentrate', 'Frozen Pizza', 'Frozen Meals', 'Frozen Burritos',
    'Frozen Waffles', 'Frozen Pancakes', 'Frozen French Fries', 'Tater Tots', 'Hash Browns',
    'Frozen Vegetables', 'Frozen Berries', 'Frozen Peas', 'Frozen Corn', 'Frozen Spinach',
    'Frozen Broccoli', 'Frozen Cauliflower', 'Frozen Carrots', 'Frozen Green Beans', 'Frozen Mushrooms',
    'Frozen Edamame', 'Frozen Zucchini', 'Frozen Eggplant', 'Frozen Brussels Sprouts', 'Frozen Kale',
    'Frozen Strawberries', 'Frozen Blueberries', 'Frozen Raspberries', 'Frozen Blackberries', 
    'Frozen Mango', 'Frozen Pineapple', 'Frozen Avocado', 'Frozen Papaya', 'Frozen Acai', 
    'Frozen Banana', 'Frozen Watermelon', 'Frozen Cantaloupe', 'Frozen Honeydew', 'Frozen Grapes', 
    'Frozen Oranges', 'Frozen Peaches', 'Frozen Pears', 'Frozen Plums', 'Frozen Cherries',
    'Frozen Apples', 'Frozen Cranberries', 'Frozen Coconut']

export default AddItemModal;
