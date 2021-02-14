/**
 * The set of objects of the project, with their type and location
 **/ 

// Variables for object types
var room = 'room';
var solid = 'solid';
var furniture = 'furniture';
var bedroom = 'bedroom';
var childroom = 'childroom';
var living_room = "living room";
var kitchen = 'kitchen';
var office = 'office';
var decor = 'decor';
var tool = 'tool';

var objectsList = {
	'Pianta rettangolare': {location: 'empty_room/room_rect.json', type: room}, 
	'Pianta quadrata': {location: 'empty_room/square_room.json', type: room}, 
    'Pianta a L': {location: 'empty_room/room_elle.json', type: room}, 
    'Bed': {location: 'bed/bed.json', type: furniture, place: bedroom},
    'Wardrobe': {location: 'wardrobe/wardrobe.json', type: furniture, place: bedroom},
    'Sideboard': {location: 'sideboard/sideboard.json', type: furniture, place: bedroom},
    'Child bed': {location: 'child_bed/child-bed.json', type: furniture, place: childroom},
    'Baby bed': {location: 'baby_bed/baby-bed.json', type: furniture, place: childroom},
    'Changing table': {location: 'changing_table/changing-table.json', type: furniture, place: childroom},
    'Child desk': {location: 'child_desk/child-desk.json', type: furniture, place: childroom},
    'Child desk 2': {location: 'child_desk_second/child-desk-second.json', type: furniture, place: childroom},
    'Toy xylophone': {location: 'xylophone/xylophone.json', type: furniture, place: childroom},
    'Toy train': {location: 'toy_train/toy-train.json', type: furniture, place: childroom},
    'Toy letter cubes': {location: 'letter_cubes/letter-cubes.json', type: furniture, place: childroom},
    'Shelf double': {location: 'shelf/shelf.json', type: furniture, place: childroom},
    'Shelf type1': {location: 'shelf3/shelf3.json', type: furniture, place: childroom},
    'Shelf type2': {location: 'shelf2/shelf2.json', type: furniture, place: childroom},
    'Coffee table': {location: 'coffee_table/coffee-table.json', type: furniture, place: living_room},
    'Coffee table2': {location: 'coffee_table2/coffee-table2.json', type: furniture, place: living_room},
    'Side table': {location: 'side_table/side-table.json', type: furniture, place: living_room},
    'Table lamp': {location: 'table_lamp/table-lamp.json', type: furniture, place: living_room},
    'Sofa': {location: 'sofa/sofa.json', type: furniture, place: living_room},
    'Sofa2': {location: 'sofa2/sofa2.json', type: furniture, place: living_room},
    'Armchair': {location: 'relax_chair/relax-chair.json', type: furniture, place: living_room},
    'Relax sofa': {location: 'relax_sofa/relax-sofa.json', type: furniture, place: living_room},
    'TV stand': {location: 'tv_stand/stand-tv.json', type: furniture, place: living_room},
    'TV': {location: 'tv/tv.json', type: furniture, place: living_room},
    'Wash basin': {location: 'wash_basin/wash-basin.json', type: furniture, place: kitchen},
    'Dining set': {location: 'dining_set/dining-set.json', type: furniture, place: kitchen},
    'Dining table': {location: 'dining_table/table-dining.json', type: furniture, place: kitchen},
    'Modern chair': {location: 'modern_chair/modern-chair.json', type: furniture, place: kitchen},
    'Dresser': {location: 'dresser/dresser.json', type: furniture, place: kitchen},
    'Fridge': {location: 'fridge/fridge.json', type: furniture, place: kitchen},
    'Lower cabinet': {location: 'lower_cabinet/lower-cabinet.json', type: furniture, place: kitchen},
    'Cooker': {location: 'cooker/cooker.json', type: furniture, place: kitchen},
    'Vent': {location: 'vent/vent.json', type: furniture, place: kitchen},
    'Coffee machine': {location: 'coffee_machine/coffee-machine.json', type: furniture, place: kitchen},
    'Coffee chair': {location: 'coffee_chair/coffee-chair.json', type: furniture, place: kitchen},
    'High coffee table': {location: 'high_coffee_table/high-co-table.json', type: furniture, place: kitchen},
    'Tea set': {location: 'tea_set/tea-set.json', type: furniture, place: kitchen},
    'Bar stool': {location: 'bar_stool/bar-stool.json', type: furniture, place: kitchen},
    'Isle cabinet': {location: 'isle/isle.json', type: furniture, place: kitchen},
    'Picture': {location: 'picture/picture.json', type: furniture, place: decor},
    'Car model': {location: 'car_decor/car-decor.json', type: furniture, place: decor},
    'Office set': {location: 'office_set/office-set.json', type: furniture, place: office},
    'Bookcase': {location: 'bookcase/bookcase.json', type: furniture, place: office},
    'Bookcase empty': {location: 'bookcase_empty/bookcase-empty.json', type: furniture, place: office},
    'PC': {location: 'pc/pc.json', type: furniture, place:office},
    'iMac pc': {location: 'imac_pc/pc-imac.json', type: furniture, place:office},
    'Angled desk': {location: 'angled_desk/angled-desk.json', type: furniture, place:office},
    'Ikea desk-bookcase': {location: 'ikeabookcase_desk/ikea-bookcase-desk.json', type: furniture, place:office},
    'Office chair': {location: 'office_chair/office-chair.json', type: furniture, place:office},
    'Notebook set': {location: 'notebook_set/notebook-set.json', type: furniture, place:office},
    'Wall': {location: 'wall/wall.json', type: furniture, place: tool},
    'Plane': {location: 'plane/new_grid.json', type: solid, currentMoveY: -0.1},
};
