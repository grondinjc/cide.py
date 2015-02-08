/****************************************************************************
 *  Classe: 			Modification     																					*
 *  Auteur: 			Mariane Maynard 																					*
 *	Description:	Representation d'une modification de l'utilisateur      	*
 ****************************************************************************/

#ifndef MODIFICATION
#define MODIFICATION

class Modification
{
	private:
		uint _position;
    size_t _taille;
    //uint _versionID;
    //Fichier* fichier;
		//string data
    
	public:
    //default ctor
    constexpr Modification() noexcept
      : _position{}
      , _taille{}
    {}

    constexpr Modification(uint position, size_t taille) noexcept
      : _position{position}
      , _taille{taille}
    {}

		constexpr uint getPosition() const noexcept {return _position;}
    constexpr size_t getTaille() const noexcept {return _taille;}
};

#endif //MODIFICATION
