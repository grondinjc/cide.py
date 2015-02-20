/****************************************************************************
 *  Classe:       Suppression                                               *
 *  Auteur:       Mariane Maynard                                           *
 *  Description:  Representation d'une supression de l'utilisateur          *
 ****************************************************************************/

#ifndef SUPPRESSION
#define SUPPRESSION

#include "Fichier.h"
#include "Types.h"

using namespace types;

class Suppression : public Modification
{    
  public:
    Suppression() = default;

    Suppression(pos_t position, size_t taille)
      : Modification(position, taille)
    {}

    virtual void effectuerModification(Fichier& fichier) override
    {
      fichier.supprimer(getPosition(), getTaille());
    }
};

#endif //SUPPRESSION
