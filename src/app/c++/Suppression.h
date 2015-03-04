/****************************************************************************
 *  Classe:       Suppression                                               *
 *  Auteur:       Mariane Maynard                                           *
 *  Description:  Representation d'une supression de l'utilisateur          *
 ****************************************************************************/

#ifndef SUPPRESSION
#define SUPPRESSION

#include "Fichier.h"
#include "Types.h"
#include <algorithm>

using namespace types;
using std::max;

class Suppression : public Modification
{
  public:
    Suppression() = default;

    Suppression(pos_t position, size_t taille)
      : Modification(position, taille)
    {}

    virtual void effectuerModification(Fichier& fichier) override
    {
      size_t finFichier = fichier.getContenu().size();

      //Avec les mises a jour et les modifications precedentes,
      //il se peut que la taille de la suppression depasse la fin du fichier

      //On met a jour la taille pour eviter de supprimer plus que necessaire
      if(getPosition() + getTaille() > finFichier)
        setTaille(finFichier - getPosition());

      fichier.supprimer(getPosition(), getTaille());
    }

    virtual void mettreAJourAutre(Modification& autre) const override
    {
      //this est une suppression et a ete effectuee avant autre
      pos_t posAutre = autre.getPosition();
      if(getPosition() < autre.getPosition())
      {
          autre.setPosition(posAutre - getTaille());
          autre.setPosition(max(autre.getPosition(), pos_t{}));
      }

      //this est une suppression et a ete effectuee apres autre
      //rien a faire
    }
};

#endif //SUPPRESSION
