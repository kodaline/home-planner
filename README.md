# home-planner

Neverending work in progress 3D Room planner written from scratch in WebGL (*pure WebGL, not Three.js*) and JS+JQuery.

Inspired by SweetHome3D, assignment for Computer Graphics course at PoLiMi.
Assets from:
* course material
* sweethome3d models library
* [archive 3d](https://archive3d.net)

## Use case

When you have nothing to do why not designing a new room?
Maybe for the baby, an office for work or a place to meditate and relax.

[Preview](https://planner.dueacaso.it)

## Instructions

* First choose your room planimetry style by clicking on the cube icon on the left(once you have selected a room, to change room style you need to refresh the webpage);
* You can import some furniture models using the sofa icon on the left;
* In the top right corner you can use the light bulb to manage lighting.
* Use mouse wheel to zoom-in and out in the 3D view, and left-mouse clicked + mouse move to move the camera view.
* You can also import only furniture to visualize it.
* Double click on a furniture object and then canc to remove it from the view.
* When you want to move an object double click on it, a sound will be reproduced.

**Commands for moving furniture**:

* Use w and s to move along z axis.
* Use a and d to move along x axis.
* Use z and x to scale the object.
* Use q and e to rotate the object along y axis.
* Use u and i to move along y axis.

## ToDO list

* Make the user import 3d models (correctly scaled and resized for the scene);
* Insert the feature of selecting the textures for the furniture, and the room;
* Make a 2D view where the user can draw the shape of the room (or rooms) adding also doors and windows and creating the stuff once done;
* Insert point/spot lights to simulate illumination of a room;
* Set visibility of a ceiling of a room (enable/disable);
* Re-add the skybox (better than the one implemented so far, and then removed);
* Add decorations for gardening (outdoor living/gardening/etc);
* Set a virtual tour visitor to allow the user with using w-a-s-d to go and look around as if he/she is in the scene;
* Improve shaders to make realistic rendering;
* Introduce shadows (even simple ones).
* Add functionality with both Phong and Gouraud shading (by switching in between them).
* Implement the picking of the object (selection) using ray casting, and not the pick shader (for the moment it is quite less optimized).
