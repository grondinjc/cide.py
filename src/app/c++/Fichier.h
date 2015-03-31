/****************************************************************************
 *  Classe:       Fichier                                                   *
 *  Auteur:       Mariane Maynard                                           *
 *  Description:  Representation d'un fichier ouvert sur le serveur         *
 ****************************************************************************/

#ifndef FICHIER
#define FICHIER

#include <string>
#include "Types.h"

using std::string;
using namespace types;

template<class T>
class FichierType
{
  private:
    T _contenu;

  public:
    FichierType() = default;

    FichierType(const T &contenu)
      : _contenu(contenu)
    {}

    FichierType(const char* filename)
    {}

    ~FichierType() = default;
    void ecrireSurDisque() {}
    void inserer(const char *data, pos_t position, size_t taille) {}
    void supprimer(pos_t position, size_t taille) {}
    void printContenu() {}  //Fonction de debug
    T getContenu() const {return _contenu;}
};


#include "SFichier.h"

namespace types
{
  //Classe Fichier par défaut
  using Fichier = FichierType<string>;

};

#endif //FICHIER
