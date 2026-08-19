with head_officer as (
  select p.id
  from public.profiles p
  join public.officer_accounts oa on oa.user_id = p.id
  where oa.level = 'head_officer'
  order by oa.created_at
  limit 1
),
weekly_items(weekday, meal_period, name, description, price, category, cutoff_time) as (
  values
    (1, 'Breakfast'::public.meal_period, 'Aloo Paratha & Chai', 'Fresh aloo paratha served with yogurt, achar, and milk tea.', 180, 'Pakistani Breakfast', '06:30'::time),
    (1, 'Tea Break'::public.meal_period, 'Samosa & Doodh Patti', 'Crispy potato samosa served with chutney and doodh patti.', 120, 'Tea & Snacks', '09:30'::time),
    (1, 'Lunch'::public.meal_period, 'Chicken Biryani', 'Spiced chicken biryani served with raita and fresh salad.', 380, 'Rice', '11:30'::time),
    (1, 'Dinner'::public.meal_period, 'Daal Chana & Chapati', 'Homestyle chana daal served with two chapatis, salad, and achar.', 300, 'Daal', '17:30'::time),

    (2, 'Breakfast'::public.meal_period, 'Halwa Puri', 'Two puris served with suji halwa and chana masala.', 220, 'Pakistani Breakfast', '06:30'::time),
    (2, 'Tea Break'::public.meal_period, 'Chicken Patties & Chai', 'Flaky chicken patty served with freshly brewed milk tea.', 140, 'Tea & Snacks', '09:30'::time),
    (2, 'Lunch'::public.meal_period, 'Chicken Karahi & Naan', 'Traditional chicken karahi served with two naans and salad.', 420, 'Chicken Curry', '11:30'::time),
    (2, 'Dinner'::public.meal_period, 'Aloo Keema & Chapati', 'Minced beef and potato curry served with two chapatis and raita.', 360, 'Meat Curry', '17:30'::time),

    (3, 'Breakfast'::public.meal_period, 'Anda Paratha & Chai', 'Masala omelette served with paratha and milk tea.', 190, 'Pakistani Breakfast', '06:30'::time),
    (3, 'Tea Break'::public.meal_period, 'Pakora & Chai', 'Mixed vegetable pakoras served with green chutney and tea.', 120, 'Tea & Snacks', '09:30'::time),
    (3, 'Lunch'::public.meal_period, 'Beef Pulao', 'Aromatic beef pulao served with raita and kachumber salad.', 400, 'Rice', '11:30'::time),
    (3, 'Dinner'::public.meal_period, 'Chicken Qorma & Naan', 'Traditional chicken qorma served with two naans and salad.', 400, 'Chicken Curry', '17:30'::time),

    (4, 'Breakfast'::public.meal_period, 'Chana Paratha & Chai', 'Spiced chickpeas served with paratha, achar, and milk tea.', 180, 'Pakistani Breakfast', '06:30'::time),
    (4, 'Tea Break'::public.meal_period, 'Bun Kebab & Chai', 'Pakistani-style bun kebab with chutney, onions, and milk tea.', 150, 'Tea & Snacks', '09:30'::time),
    (4, 'Lunch'::public.meal_period, 'Daal Mash & Chapati', 'Creamy mash daal served with two chapatis, salad, and achar.', 300, 'Daal', '11:30'::time),
    (4, 'Dinner'::public.meal_period, 'Chicken Handi & Naan', 'Creamy chicken handi served with two naans and fresh salad.', 430, 'Chicken Curry', '17:30'::time),

    (5, 'Breakfast'::public.meal_period, 'Qeema Paratha & Chai', 'Minced beef stuffed paratha served with yogurt and milk tea.', 240, 'Pakistani Breakfast', '06:30'::time),
    (5, 'Tea Break'::public.meal_period, 'Jalebi & Doodh Patti', 'Fresh jalebi served with a cup of doodh patti.', 130, 'Tea & Sweets', '09:30'::time),
    (5, 'Lunch'::public.meal_period, 'Chicken Pulao', 'Aromatic chicken pulao served with shami kebab, raita, and salad.', 380, 'Rice', '11:30'::time),
    (5, 'Dinner'::public.meal_period, 'Beef Nihari & Naan', 'Slow-cooked beef nihari served with two naans and traditional garnishes.', 450, 'Beef Curry', '17:30'::time),

    (6, 'Breakfast'::public.meal_period, 'Chanay & Kulcha', 'Lahori chickpeas served with two kulchas, achar, and tea.', 220, 'Pakistani Breakfast', '06:30'::time),
    (6, 'Tea Break'::public.meal_period, 'Vegetable Roll & Chai', 'Crispy vegetable roll served with chutney and milk tea.', 120, 'Tea & Snacks', '09:30'::time),
    (6, 'Lunch'::public.meal_period, 'Mutton Pulao', 'Traditional mutton pulao served with raita and fresh salad.', 480, 'Rice', '11:30'::time),
    (6, 'Dinner'::public.meal_period, 'Chicken Jalfrezi & Rice', 'Spicy chicken jalfrezi served with steamed rice and salad.', 400, 'Chicken Curry', '17:30'::time),

    (0, 'Breakfast'::public.meal_period, 'Paya & Naan', 'Traditional beef paya served with two naans and fresh garnishes.', 300, 'Pakistani Breakfast', '06:30'::time),
    (0, 'Tea Break'::public.meal_period, 'Fruit Chaat & Chai', 'Seasonal fruit chaat served with a cup of milk tea.', 140, 'Tea & Snacks', '09:30'::time),
    (0, 'Lunch'::public.meal_period, 'Sindhi Biryani', 'Spicy Sindhi chicken biryani served with raita and salad.', 400, 'Rice', '11:30'::time),
    (0, 'Dinner'::public.meal_period, 'Mix Sabzi & Chapati', 'Seasonal mixed vegetable curry served with two chapatis and raita.', 280, 'Vegetable Curry', '17:30'::time)
)
insert into public.weekly_menu_templates (
  weekday, meal_period, name, description, price, category, cutoff_time, is_available, created_by
)
select w.weekday, w.meal_period, w.name, w.description, w.price, w.category, w.cutoff_time, true, h.id
from weekly_items w
left join head_officer h on true;

select private.materialize_weekly_menu(56);
