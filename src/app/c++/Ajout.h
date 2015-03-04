/****************************************************************************
 *  Classe:       Ajout                                                     *
 *  Auteur:       Mariane Maynard                                           *
 *  Description:  Representation d'un ajout de l'utilisateur                *
 ****************************************************************************/

#ifndef AJOUT
#define AJOUT

#include "Fichier.h"
#include "Types.h"

using namespace types;

class Ajout : public Modification
{
  private:
    string _data;

  public:
    Ajout() = default;

    Ajout(pos_t position, size_t taille, const string& data)
      : Modification(position, taille)
      , _data{data}
    {}

    Ajout(pos_t position, const string& data)
      : Modification(position, data.size())
      , _data{data}
    {}

    virtual void effectuerModification(Fichier& fichier) override
    {
      fichier.inserer(_data.c_str(), getPosition(), getTaille());
    }

    virtual void mettreAJourAutre(Modification& autre) const override
    {
      //cas possibles:
      //this est un ajout et a ete effectue apres autre (pos)
      //rien a faire

      //this est un ajout et a ete effectue avant autre (pos)
      pos_t posAutre = autre.getPosition();
      if(getPosition() <= posAutre)
          autre.setPosition(posAutre + getTaille());
    }
};

#endif //AJOUT
